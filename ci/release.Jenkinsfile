def MAJOR
def MINOR
def PATCH
def NEW_VERSION
def RELEASE_BRANCH

pipeline {
    agent any

    parameters {
        choice(name: 'BUMP', choices: ['Z', 'Y', 'X'], description: 'Qué parte de la versión incrementar (X=Major, Y=Minor, Z=Patch)')
    }

    environment {
        GIT_USER_NAME = 'Jenkins CI'
        GIT_USER_EMAIL = 'jenkins@m910q.com'
    }

    stages {
        stage('Checkout y configuración') {
      steps {
        script {
          echo 'Configurando Git...'
          checkout scm
          sh "git config user.name '${env.GIT_USER_NAME}'"
          sh "git config user.email '${env.GIT_USER_EMAIL}'"
          sh 'git fetch --all --tags'

          // Checkout explícito de develop
          sh 'git checkout develop'
          sh 'git pull origin develop'
        }
      }
        }

        stage('Validación') {
      steps {
        script {
          echo 'Validando precondiciones...'

          def currentBranch = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
          if (currentBranch != 'develop') {
            error "El release debe iniciarse desde 'develop'. Rama actual: ${currentBranch}"
          }

          def gitStatus = sh(script: 'git status --porcelain', returnStdout: true).trim()
          if (gitStatus) {
            error 'Hay cambios sin commitear.'
          }

          echo 'Validación completada'
        }
      }
        }

        stage('Calcular nueva versión') {
      steps {
        script {
          echo 'Calculando nueva versión...'

          def raw = sh(script: 'jq -r .version package.json', returnStdout: true).trim()
          def ver = raw.tokenize('.')

          MAJOR = ver[0].toInteger()
          MINOR = ver[1].toInteger()
          PATCH = ver[2].toInteger()

          echo "Versión actual: ${MAJOR}.${MINOR}.${PATCH}"

          if (params.BUMP == 'X') {
            MAJOR++
            MINOR = 0
            PATCH = 0
                    } else if (params.BUMP == 'Y') {
            MINOR++
            PATCH = 0
                    } else if (params.BUMP == 'Z') {
            PATCH++
          }

          NEW_VERSION = "${MAJOR}.${MINOR}.${PATCH}"
          RELEASE_BRANCH = "release/${NEW_VERSION}"

          echo "Nueva versión: ${NEW_VERSION}"

          def tagExists = sh(script: "git tag -l v${NEW_VERSION}", returnStdout: true).trim()
          if (tagExists) {
            error "El tag v${NEW_VERSION} ya existe."
          }
        }
      }
        }

        stage('Crear rama release') {
      steps {
        script {
          echo "Creando rama: ${RELEASE_BRANCH}"
          sh "git checkout -b ${RELEASE_BRANCH}"
        }
      }
        }

        stage('Actualizar versión') {
      steps {
        script {
          echo "Actualizando versión a ${NEW_VERSION}..."

          sh """
                        jq --arg v '${NEW_VERSION}' '.version = \$v' package.json > tmp.json
                        mv tmp.json package.json
                    """

          sh 'git add package.json'
          sh "git commit -m 'chore: bump version to ${NEW_VERSION}'"

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push --set-upstream origin ${RELEASE_BRANCH}
                        """
          }

          echo 'Versión actualizada'
        }
      }
        }

        stage('Merge a main') {
      steps {
        script {
          echo 'Mergeando a main...'

          sh 'git checkout main'
          sh 'git pull origin main'
          sh "git merge --no-ff ${RELEASE_BRANCH} -m 'chore: release ${NEW_VERSION}'"

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin main
                        """
          }

          echo 'Mergeado a main'
        }
      }
        }

        stage('Crear tag') {
      steps {
        script {
          echo "Creando tag v${NEW_VERSION}..."

          sh "git tag -a v${NEW_VERSION} -m 'Release ${NEW_VERSION}'"

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin v${NEW_VERSION}
                        """
          }

          echo 'Tag creado'
        }
      }
        }

        stage('Merge a develop') {
      steps {
        script {
          echo 'Mergeando a develop...'

          sh 'git checkout develop'
          sh 'git pull origin develop'
          sh "git merge --no-ff ${RELEASE_BRANCH} -m 'chore: merge release ${NEW_VERSION} back to develop'"

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin develop
                        """
          }

          echo 'Mergeado a develop'
        }
      }
        }

        stage('Limpiar rama release') {
      steps {
        script {
          echo 'Eliminando rama release...'

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin --delete ${RELEASE_BRANCH}
                        """
          }

          sh "git branch -d ${RELEASE_BRANCH} || true"

          echo 'Rama eliminada'
        }
      }
        }
    }

    post {
        success {
      echo """
            RELEASE COMPLETADO
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Release v${NEW_VERSION} creado exitosamente

            Cambios:
            • Versión: ${NEW_VERSION}
            • Tag: v${NEW_VERSION}
            • Mergeado a main y develop

            GitHub: https://github.com/sierrapablo/portfolio-web/releases/tag/v${NEW_VERSION}
            """
        }

        failure {
      echo """
            RELEASE FALLIDO
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Limpia manualmente si es necesario:
              git branch -D ${RELEASE_BRANCH}
              git push origin --delete ${RELEASE_BRANCH}
            """
        }

        always {
      sh 'git checkout develop || true'
        }
    }
}
