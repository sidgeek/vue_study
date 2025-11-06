pipeline {
  agent any
  environment {
    PNPM_VERSION = '10.20.0'
    ADMIN_CHANGED = 'false'
    SERVER_CHANGED = 'false'
    NODE_IMAGE = 'node:18-alpine'
  }
  options {
    disableConcurrentBuilds()
    timestamps()
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Detect Changes') {
      steps {
        script {
          def previous = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
          if (!previous || previous.trim().isEmpty()) {
            // 首次构建或无成功基线时回退一个提交
            previous = sh(returnStdout: true, script: 'git rev-parse HEAD~1').trim()
          }
          def diff = sh(returnStdout: true, script: "git diff --name-only ${previous} ${env.GIT_COMMIT}").trim()
          def files = diff ? diff.split(/\r?\n/) : []
          def adminTouched = files.any { it.startsWith('apps/admin/') }
          def serverTouched = files.any { it.startsWith('apps/server/') }
          env.ADMIN_CHANGED = adminTouched.toString()
          env.SERVER_CHANGED = serverTouched.toString()
          echo "Changed paths -> admin=${env.ADMIN_CHANGED}, server=${env.SERVER_CHANGED}"
        }
      }
    }

    stage('Install workspace (docker)') {
      steps {
        sh """
          set -euo pipefail
          docker run --rm \
            --user \$(id -u):\$(id -g) \
            -v "${env.WORKSPACE}":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc '
              set -eux
              echo "Container user (uid:gid):"; id -u; id -g
              echo "Workspace mount perms:"; ls -ldn /workspace
              echo "Workspace top-level:"; ls -la /workspace
              echo "Workspace tree /workspace/apps:"; ls -la /workspace/apps || true
              if [ ! -d /workspace/apps ]; then
                echo "ERROR: Missing /workspace/apps"
                echo "Listing /workspace for diagnostics:"; find /workspace -maxdepth 2 -type d -print
                exit 2
              fi
              test -f /workspace/pnpm-workspace.yaml && echo "Found pnpm-workspace.yaml" || echo "WARN: pnpm-workspace.yaml not found at root"
              echo "Node diagnostics:"; node -v; npm -v
              corepack enable || true
              corepack prepare pnpm@${PNPM_VERSION} --activate || npm i -g pnpm@${PNPM_VERSION}
              pnpm -v; command -v pnpm || true
              echo "Admin package presence:"; ls -la /workspace/apps/admin
              test -f /workspace/apps/admin/package.json || { echo "ERROR: admin/package.json missing"; exit 2; }
              echo "Server package presence:"; ls -la /workspace/apps/server
              test -f /workspace/apps/server/package.json || { echo "ERROR: server/package.json missing"; exit 2; }
              cd /workspace/apps/admin && pnpm install --prefer-frozen-lockfile
              cd /workspace/apps/server && pnpm install --prefer-frozen-lockfile
            '
        """
      }
    }

    stage('Build Admin') {
      when { expression { return env.ADMIN_CHANGED == 'true' } }
      steps {
        sh """
          docker run --rm \
            --user \$(id -u):\$(id -g) \
            -v "${env.WORKSPACE}":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc '
              set -eux
              echo "Workspace /workspace/apps/admin contents:"; ls -la /workspace/apps/admin
              corepack enable || true
              corepack prepare pnpm@${PNPM_VERSION} --activate || npm i -g pnpm@${PNPM_VERSION}
              pnpm -v; node -v
              cd /workspace/apps/admin && pnpm build
            '
        """
      }
    }

    stage('Build Server') {
      when { expression { return env.SERVER_CHANGED == 'true' } }
      steps {
        sh """
          docker run --rm \
            --user \$(id -u):\$(id -g) \
            -v "${env.WORKSPACE}":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc '
              set -eux
              echo "Workspace /workspace/apps/server contents:"; ls -la /workspace/apps/server
              corepack enable || true
              corepack prepare pnpm@${PNPM_VERSION} --activate || npm i -g pnpm@${PNPM_VERSION}
              pnpm -v; node -v
              cd /workspace/apps/server && pnpm build
            '
        """
      }
    }

    stage('Deploy Admin') {
      when { expression { return env.ADMIN_CHANGED == 'true' } }
      steps {
        script {
          if (fileExists('docker-compose.yml')) {
            sh 'docker compose -f docker-compose.yml up -d --build admin'
          } else {
            sh 'docker build -t admin:latest -f apps/admin/Dockerfile apps/admin'
            sh 'docker rm -f admin || true'
            sh 'docker run -d --name admin -p 5173:80 admin:latest'
          }
        }
      }
    }

    stage('Deploy Server') {
      when { expression { return env.SERVER_CHANGED == 'true' } }
      steps {
        script {
          if (fileExists('docker-compose.yml')) {
            sh 'docker compose -f docker-compose.yml up -d --build server'
          } else {
            def rev = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
            def image = "server:${rev}"
            sh """
              docker build -t ${image} -f apps/server/Dockerfile --build-arg REV_NO=${rev} apps/server
              docker tag ${image} server:latest
              docker rm -f server-app || true
              docker run -d --name server-app --restart unless-stopped -p 3000:3000 server:latest
            """
          }
        }
      }
    }
  }
}