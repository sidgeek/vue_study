node {
  properties([
    disableConcurrentBuilds(),
    parameters([
      choice(name: 'DB_MODE', choices: ['postgres', 'sqlite'], description: '选择数据库部署模式（默认 postgres）'),
      password(name: 'PG_PASSWORD', defaultValue: '', description: 'Postgres 密码（不展示，由 Jenkins 管理）'),
      booleanParam(name: 'FORCE_FULL_BUILD', defaultValue: true, description: '强制全量构建（首次跑通）'),
      string(name: 'COS_BUCKET', defaultValue: 'music-1312857193', description: 'COS Bucket（非敏感配置，可覆盖）'),
      string(name: 'COS_REGION', defaultValue: 'ap-shanghai', description: 'COS Region（非敏感配置，可覆盖）'),
      string(name: 'COS_SONGS_PREFIX', defaultValue: 'music/', description: 'COS 前缀（非敏感配置，可覆盖）'),
      string(name: 'COS_SIGN_EXPIRE_SECONDS', defaultValue: '3600', description: '签名有效期（秒）')
    ])
  ])
  def rev_no = ""
  def image_name = "server"
  def image_full = ""
  def branch_name = ""
  def base_commit = ""
  def changed_server = false
  def changed_admin = false
  def changed_packages = false
  def forceBuild = params.FORCE_FULL_BUILD

  stage('Checkout'){
    checkout scm
    rev_no = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
    // 识别当前构建分支，兼容多种 Jenkins 作业形态
    branch_name = sh(returnStdout: true, script: '''
      set -euo pipefail
      if [ -n "${BRANCH_NAME:-}" ]; then
        echo "$BRANCH_NAME"
      elif [ -n "${GIT_BRANCH:-}" ]; then
        echo "${GIT_BRANCH#origin/}"
      elif [ -n "${CHANGE_BRANCH:-}" ]; then
        echo "$CHANGE_BRANCH"  # PR 构建分支
      else
        # 从包含当前提交的远端分支推断，取第一个匹配
        git branch -r --contains HEAD | sed -n '1{s#^ *origin/##;p}'
      fi
    ''').trim()
    image_full = "${image_name}:${branch_name}-${rev_no}"
    echo "BRANCH=${branch_name}, REV_NO=${rev_no}, IMAGE=${image_full}"
    base_commit = sh(returnStdout: true, script: '''
      set -euo pipefail
      if [ -n "${CHANGE_TARGET:-}" ]; then
        git merge-base "origin/${CHANGE_TARGET}" HEAD
      elif [ -n "${GIT_PREVIOUS_SUCCESSFUL_COMMIT:-}" ]; then
        echo "${GIT_PREVIOUS_SUCCESSFUL_COMMIT}"
      elif git rev-parse -q --verify HEAD~1 >/dev/null 2>&1; then
        git rev-parse HEAD~1
      else
        git merge-base origin/"${BRANCH_NAME:-main}" HEAD
      fi
    ''').trim()
  }

  stage('Detect Changes'){
    changed_server = (sh(returnStatus: true, script: "git diff --name-only ${base_commit}..HEAD | grep -E '^apps/server/' >/dev/null") == 0)
    changed_admin = (sh(returnStatus: true, script: "git diff --name-only ${base_commit}..HEAD | grep -E '^apps/admin/' >/dev/null") == 0)
    changed_packages = (sh(returnStatus: true, script: "git diff --name-only ${base_commit}..HEAD | grep -E '^packages/' >/dev/null") == 0)
    echo "changed_server=${changed_server}, changed_admin=${changed_admin}, changed_packages=${changed_packages}"
  }

  stage('Install & Turbo Build Changed'){
    if (forceBuild || changed_server || changed_admin || changed_packages) {
      sh """
        set -euo pipefail
        corepack enable
        pnpm -v
        pnpm install --frozen-lockfile
        ${forceBuild ? 'pnpm turbo run build' : "pnpm turbo run build --filter=...[${base_commit}] --parallel"}
      """
    } else {
      echo 'No changes detected for workspace build'
    }
  }

  stage('Build Server Image'){
    if (forceBuild || changed_server || changed_packages) {
      sh """
        set -euo pipefail
        docker --version
        docker build -t ${image_full} -f apps/server/Dockerfile apps/server
        docker tag ${image_full} ${image_name}:${branch_name}-latest
        docker tag ${image_full} ${image_name}:latest
      """
    } else {
      echo 'Skip server image build'
    }
  }

  stage('Deploy'){
    // 支持 SQLite/Postgres 两种部署
    def safeBranch = branch_name.replaceAll('[^A-Za-z0-9_.-]', '-')
    def containerName = "server-app-${safeBranch}"
    def networkName = "net-${safeBranch}"
    def hostPort = (branch_name == 'main') ? '3000' : (branch_name == 'dev' ? '3001' : '0')

    // 直接写死本次有效的 DB_MODE，优先保障 Postgres 路径
    def dbMode = 'postgres'
    echo "Effective DB_MODE=${dbMode} (requested ${params.DB_MODE})"

    if (dbMode == 'postgres') {
      def dbContainerName = "postgres-db-${safeBranch}"
      def dbVolumeName = "postgres-data-${safeBranch}"
      def dbHostPort = (branch_name == 'main') ? '5432' : (branch_name == 'dev' ? '5433' : '0')

      withCredentials([
        string(credentialsId: 'pg-password', variable: 'POSTGRES_PASSWORD'),
        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
        string(credentialsId: 'cos-secret-id', variable: 'COS_SECRET_ID'),
        string(credentialsId: 'cos-secret-key', variable: 'COS_SECRET_KEY')
      ]) {
        sh """
          set -euo pipefail
          chmod +x scripts/deploy_postgres.sh || true
          POSTGRES_PASSWORD='${POSTGRES_PASSWORD}' \
          COS_BUCKET='${params.COS_BUCKET}' COS_REGION='${params.COS_REGION}' COS_SONGS_PREFIX='${params.COS_SONGS_PREFIX}' COS_SIGN_EXPIRE_SECONDS='${params.COS_SIGN_EXPIRE_SECONDS}' \
          bash scripts/deploy_postgres.sh '${containerName}' '${image_full}' '${dbContainerName}' '${dbVolumeName}' '${networkName}' '${hostPort}' '${dbHostPort}'
        """
      }

      if (hostPort == '0') {
        sh """
          docker port ${containerName} 3000 | sed -n '1p' | awk '{print "Feature branch URL: http://"\$0}'
        """
      } else {
        echo "Service URL: http://localhost:${hostPort}"
      }

      if (dbHostPort == '0') {
        sh """
          docker port ${dbContainerName} 5432 | sed -n '1p' | awk '{print "DB URL: postgresql://postgres:postgres@"\$0"/appdb"}'
        """
      } else {
        echo "DB URL: postgresql://postgres:postgres@localhost:${dbHostPort}/appdb"
      }

      // ---- Build & Deploy Admin (Nginx) ----
      def adminImage = "admin:${branch_name}-${rev_no}"
      def adminContainerName = "admin-app-${safeBranch}"
      def adminHostPort = (branch_name == 'main') ? '80' : (branch_name == 'dev' ? '3006' : '0')

      // Resolve effective server port (feature branches may use random host port)
      def effectiveServerPort = hostPort
      if (hostPort == '0') {
        effectiveServerPort = sh(returnStdout: true, script: """
          set -euo pipefail
          docker port ${containerName} 3000 | sed -n '1p' | awk -F: '{print \$2}'
        """).trim()
      }

      // 为线上环境（main 分支）固定 API 地址，其它分支使用后端实际端口
      def adminApiBase = (branch_name == 'main') ? 'http://106.54.186.241:3000' : "http://localhost:${effectiveServerPort}"
      if (forceBuild || changed_admin || changed_packages) {
        echo "Building admin image with VITE_API_BASE=${adminApiBase}"
        sh """
          set -euo pipefail
          docker build -t ${adminImage} -f apps/admin/Dockerfile apps/admin \
            --build-arg VITE_API_BASE=${adminApiBase}
          docker tag ${adminImage} admin:${branch_name}-latest
        """
      } else {
        echo 'Skip admin image build'
      }

      // Run admin container
      sh """
        set -euo pipefail
        docker rm -f ${adminContainerName} || true
        if [ "${adminHostPort}" = "0" ]; then
          docker run -d --name ${adminContainerName} --restart unless-stopped --network ${networkName} -p 80 ${adminImage}
          docker port ${adminContainerName} 80 | sed -n '1p' | awk '{print "Admin URL: http://"\$0}'
        else
          docker run -d --name ${adminContainerName} --restart unless-stopped --network ${networkName} -p ${adminHostPort}:80 ${adminImage}
          echo "Admin URL: http://localhost:${adminHostPort}"
        fi
      """
    } else {
      def dataVolumeName = "server-dev-data-${safeBranch}"

      withCredentials([
        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
      ]) {
        sh """
          set -euo pipefail
          chmod +x scripts/deploy_sqlite.sh || true
          bash scripts/deploy_sqlite.sh '${containerName}' '${image_full}' '${networkName}' '${hostPort}' '${dataVolumeName}'
        """
      }

      if (hostPort == '0') {
        sh """
          docker port ${containerName} 3000 | sed -n '1p' | awk '{print "Feature branch URL: http://"\$0}'
        """
      } else {
        echo "Service URL: http://localhost:${hostPort}"
      }
      echo "Prisma Studio URL: http://localhost:5556"
      echo "DB: SQLite file persisted in Docker volume '${dataVolumeName}'"
    }
  }
}