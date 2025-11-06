node {
    properties([disableConcurrentBuilds()])
    def rev_no = ""
    def image_name = "server"
    def image_full = ""
    def container_name = "server-app"

    stage('Checkout'){
        checkout scm
        rev_no = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
        image_full = "${image_name}:${rev_no}"
        echo "REV_NO=${rev_no}, IMAGE=${image_full}"
    }

    stage('Build Image'){
        // 参考 /11：直接构建与标记镜像（apps/server 作为上下文）
        sh """
          set -euo pipefail
          docker --version
          docker build -t ${image_full} -f apps/server/Dockerfile --build-arg REV_NO=${rev_no} apps/server
          docker tag ${image_full} ${image_name}:latest
        """
    }

    stage('Deploy'){
        // 停旧容器并以当前提交镜像启动 server 服务
        sh """
          set -euo pipefail
          # 停止并删除旧容器（如果存在）
          if docker ps -a --format '{{.Names}}' | grep -w ${container_name} >/dev/null 2>&1; then
            docker rm -f ${container_name} || true
          fi

          # 使用版本化标签运行新容器，避免 latest 混淆
          docker run -d \
            --name ${container_name} \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            -e JWT_SECRET=dev-secret \
            -e DATA_SOURCE=file \
            -e DATA_FILE_PATH=/app/data/db.json \
            -v server-data:/app/data \
            ${image_full}

          # 简单健康检查与镜像确认
          docker inspect -f '{{ .Config.Image }}' ${container_name} | grep -q '${image_full}'
          docker logs --since 5s ${container_name} || true
        """
    }
}