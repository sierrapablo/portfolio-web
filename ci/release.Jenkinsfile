pipeline {
    agent any

    parameters {
        choice(name: 'BUMP', choices: ['X', 'Y', 'Z'], description: 'Qué parte de la versión incrementar (X=Major, Y=Minor, Z=Patch)')
    }

    environment {
        GIT_USER_NAME = 'Jenkins CI'
        GIT_USER_EMAIL = 'proyectos@sierrapablo.dev'
    }

    stages {
        stage('Checkout') {
      steps {
        checkout scm
        sh 'git checkout develop'
      }
        }

        stage('Leer package.json') {
      steps {
        script {
          def rawVersion = sh(script: 'jq -r .version package.json', returnStdout: true).trim()
          def ver = rawVersion.tokenize('.')

          int major = ver[0].toInteger()
          int minor = ver[1].toInteger()
          int patch = ver[2].toInteger()

          if (params.BUMP == 'X') {
            major += 1
            minor = 0
            patch = 0
                    } else if (params.BUMP == 'Y') {
            minor += 1
            patch = 0
                    } else if (params.BUMP == 'Z') {
            patch += 1
          }

          env.NEW_VERSION = "${major}.${minor}.${patch}"
          echo "Nueva versión calculada: ${env.NEW_VERSION}"
        }
      }
        }

        stage('Commit vacío de release') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              git config user.name "${env.GIT_USER_NAME}"
              git config user.email "${env.GIT_USER_EMAIL}"
              git add --all
              git commit --allow-empty -m "/release-${env.NEW_VERSION}"
              git push -u origin develop
            """
          }
        }
      }
        }
    }
}
