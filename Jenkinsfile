node {
  properties([
    disableConcurrentBuilds(),
    parameters([
      choice(name: 'DB_MODE', choices: ['sqlite', 'postgres'], description: '选择数据库部署模式')
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

    if (params.DB_MODE == 'postgres') {
      def dbContainerName = "postgres-db-${safeBranch}"
      def dbVolumeName = "postgres-data-${safeBranch}"
      def dbHostPort = (branch_name == 'main') ? '5432' : (branch_name == 'dev' ? '5433' : '0')

      sh """
        set -euo pipefail
        docker network inspect ${networkName} >/dev/null 2>&1 || docker network create ${networkName}

        docker rm -f ${containerName} || true
        docker rm -f ${dbContainerName} || true

        DB_HOST_PORT="${dbHostPort}"
        if [ "\$DB_HOST_PORT" = "0" ]; then
          DB_PORT_FLAG=""
        else
          DB_PORT_FLAG="-p ${dbHostPort}:5432"
        fi

        docker run -d \
          --name ${dbContainerName} \
          --restart unless-stopped \
          --network ${networkName} \
          ${'$'}DB_PORT_FLAG \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=appdb \
          -v ${dbVolumeName}:/var/lib/postgresql/data \
          postgres:15

        set -x
        for i in \$(seq 1 30); do
          if docker exec ${dbContainerName} pg_isready -U postgres -d postgres; then
            echo "[jenkins] Postgres accepting connections"; break; fi
          sleep 2
        done

        # 如果命名卷已存在，POSTGRES_DB不会再次创建数据库；这里显式创建
        docker exec ${dbContainerName} sh -lc '
          if ! psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname=\'appdb\'" | grep -q 1; then
            echo "[jenkins] Creating database appdb...";
            psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"appdb\";";
          else
            echo "[jenkins] Database appdb already exists.";
          fi
          psql -U postgres -d appdb -v ON_ERROR_STOP=1 -c "CREATE SCHEMA IF NOT EXISTS public;"
        '

        HOST_PORT="${hostPort}"
        if [ "\$HOST_PORT" = "0" ]; then
          PORT_FLAG="-p 3000"
        else
          PORT_FLAG="-p ${hostPort}:3000"
        fi

        docker run -d \
          --name ${containerName} \
          --restart unless-stopped \
          --network ${networkName} \
          ${'$'}PORT_FLAG \
          -e NODE_ENV=production \
          -e JWT_SECRET=dev-secret \
          -e DATA_SOURCE=postgres \
          -e DATABASE_URL=postgresql://postgres:postgres@${dbContainerName}:5432/appdb?schema=public \
          -e AUTO_MIGRATE=true \
          ${image_full}

        docker inspect -f '{{ .Config.Image }}' ${containerName} | grep -q '${image_full}'
        docker logs --since 5s ${containerName} || true
      """

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
    } else {
      def dataVolumeName = "server-dev-data-${safeBranch}"

      sh """
        set -euo pipefail
        docker network inspect ${networkName} >/dev/null 2>&1 || docker network create ${networkName}

        docker rm -f ${containerName} || true

        HOST_PORT="${hostPort}"
        if [ "\$HOST_PORT" = "0" ]; then
          PORT_FLAG="-p 3000"
        else
          PORT_FLAG="-p ${hostPort}:3000"
        fi

        docker run -d \
          --name ${containerName} \
          --restart unless-stopped \
          --network ${networkName} \
          ${'$'}PORT_FLAG \
          -e NODE_ENV=production \
          -e JWT_SECRET=dev-secret \
          -e DATA_SOURCE=file \
          -e DATABASE_URL=file:/app/dev-data/dev.db \
          -e AUTO_MIGRATE=false \
          -v ${dataVolumeName}:/app/dev-data \
          ${image_full}

        docker inspect -f '{{ .Config.Image }}' ${containerName} | grep -q '${image_full}'

        docker exec ${containerName} sh -lc 'npx prisma db push --skip-generate'
        docker exec ${containerName} sh -lc 'node scripts/seed.js'
        docker logs --since 5s ${containerName} || true
      """

      if (hostPort == '0') {
        sh """
          docker port ${containerName} 3000 | sed -n '1p' | awk '{print "Feature branch URL: http://"\$0}'
        """
      } else {
        echo "Service URL: http://localhost:${hostPort}"
      }
      echo "DB: SQLite file persisted in Docker volume '${dataVolumeName}'"
    }
  }
}