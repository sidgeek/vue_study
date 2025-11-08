node {
  properties([disableConcurrentBuilds()])
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
      docker build -t ${image_full} -f apps/server/Dockerfile --build-arg REV_NO=${rev_no} apps/server
      docker tag ${image_full} ${image_name}:${branch_name}-latest
      docker tag ${image_full} ${image_name}:latest
    """
  }

  stage('Deploy'){
    // 按分支部署：main/dev 固定端口；feat 分支随机端口便于并行测试
    def safeBranch = branch_name.replaceAll('[^A-Za-z0-9_.-]', '-')
    def containerName = "server-app-${safeBranch}"
    def dbContainerName = "postgres-db-${safeBranch}"
    def networkName = "net-${safeBranch}"
    def dbVolumeName = "postgres-data-${safeBranch}"
    def hostPort = (branch_name == 'main') ? '3000' : (branch_name == 'dev' ? '3001' : '0')

    sh """
      set -euo pipefail
      # 网络与资源准备
      docker network inspect ${networkName} >/dev/null 2>&1 || docker network create ${networkName}

      # 清理旧容器（保留卷以持久化数据）
      docker rm -f ${containerName} || true
      docker rm -f ${dbContainerName} || true

      # 启动 Postgres（卷按分支隔离）
      docker run -d \
        --name ${dbContainerName} \
        --restart unless-stopped \
        --network ${networkName} \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=appdb \
        -v ${dbVolumeName}:/var/lib/postgresql/data \
        postgres:15

      # 等待数据库就绪
      for i in $(seq 1 30); do
        if docker exec ${dbContainerName} pg_isready -U postgres -d appdb; then
          break
        fi
        sleep 2
      done

      docker run -d \
        --name ${containerName} \
        --restart unless-stopped \
        --network ${networkName} \
        -p ${hostPort}:3000 \
        -e NODE_ENV=production \
        -e JWT_SECRET=dev-secret \
        -e DATA_SOURCE=postgres \
        -e DATABASE_URL=postgresql://postgres:postgres@${dbContainerName}:5432/appdb?schema=public \
        -e AUTO_MIGRATE=true \
        ${image_full}

      docker inspect -f '{{ .Config.Image }}' ${containerName} | grep -q '${image_full}'

      docker logs --since 5s ${containerName} || true
    """

    // 输出可访问地址；feat/* 使用随机端口时解析映射结果（在 Groovy 侧做条件判断，避免 GString 与 Shell 的 $ 冲突）
    if (hostPort == '0') {
      sh """
        docker port ${containerName} 3000 | sed -n '1p' | awk '{print "Feature branch URL: http://"\$0}'
      """
    } else {
      echo "Service URL: http://localhost:${hostPort}"
    }
  }
}