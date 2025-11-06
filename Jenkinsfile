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
            -v "\$PWD":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc '
              corepack enable || true;
              corepack prepare pnpm@${PNPM_VERSION} --activate || npm i -g pnpm@${PNPM_VERSION};
              pnpm -v;
              pnpm install -w --prefer-frozen-lockfile;
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
            -v "\$PWD":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc 'pnpm --filter ./apps/admin build'
        """
      }
    }

    stage('Build Server') {
      when { expression { return env.SERVER_CHANGED == 'true' } }
      steps {
        sh """
          docker run --rm \
            --user \$(id -u):\$(id -g) \
            -v "\$PWD":/workspace \
            -w /workspace \
            ${NODE_IMAGE} sh -lc 'pnpm --filter ./apps/server build'
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