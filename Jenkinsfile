node {
  properties([
    disableConcurrentBuilds(),
    parameters([
      choice(name: 'DB_MODE', choices: ['postgres', 'sqlite'], description: '选择数据库部署模式（默认 postgres）')
    ])
  ])
  def rev_no = ""
  def image_name = "server"
  def image_full = ""
  def branch_name = ""

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
  }

  stage('Build Image'){
    // 构建与按分支标记镜像（apps/server 为上下文）
    sh """
      set -euo pipefail
      docker --version
      docker build -t ${image_full} -f apps/server/Dockerfile apps/server
      docker tag ${image_full} ${image_name}:${branch_name}-latest
      docker tag ${image_full} ${image_name}:latest
    """
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

      sh """
        set -euo pipefail
        chmod +x scripts/deploy_postgres.sh || true
        bash scripts/deploy_postgres.sh '${containerName}' '${image_full}' '${dbContainerName}' '${dbVolumeName}' '${networkName}' '${hostPort}' '${dbHostPort}'
      """

      if (hostPort == '0') {
        sh """
          docker port ${containerName} 3000 | sed -n '1p' | awk '{print "Feature branch URL: http://"\$0}'
        """
      } else {
        echo "Service URL: http://localhost:${hostPort}"
      }
      echo "Prisma Studio URL: http://localhost:5556"

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
      echo "Building admin image with VITE_API_BASE=${adminApiBase}"
      sh """
        set -euo pipefail
        docker build -t ${adminImage} -f apps/admin/Dockerfile apps/admin \
          --build-arg VITE_API_BASE=${adminApiBase}
        docker tag ${adminImage} admin:${branch_name}-latest
      """

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

      sh """
        set -euo pipefail
        chmod +x scripts/deploy_sqlite.sh || true
        bash scripts/deploy_sqlite.sh '${containerName}' '${image_full}' '${networkName}' '${hostPort}' '${dataVolumeName}'
      """

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