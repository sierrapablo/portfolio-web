def MAJOR
def MINOR
def PATCH
def NEW_VERSION
def RELEASE_BRANCH

pipeline {
    agent any

    parameters {
        choice(name: 'BUMP', choices: ['X', 'Y', 'Z'], description: 'Qué parte de la versión incrementar')
    }

    stages {
        stage('Checkout develop') {
      steps {
        checkout scm
        sh 'git config user.name "Jenkins CI"'
        sh 'git config user.email "jenkins@m910q.com"'
      }
        }

        stage('Read current version') {
      steps {
        script {
          def raw = sh(script: 'jq -r .version package.json', returnStdout: true).trim()
          def ver = raw.tokenize('.')

          MAJOR = ver[0].toInteger()
          MINOR = ver[1].toInteger()
          PATCH = ver[2].toInteger()

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
        }
      }
        }

        stage('Create release branch') {
      steps {
        sh "git checkout -b ${RELEASE_BRANCH}"
      }
        }

        stage('Update version on release branch') {
      steps {
        script {
            // Actualizar package.json
            sh """
                set -e
                # Actualiza la versión en package.json
                jq --arg v '${NEW_VERSION}' '.version = \$v' package.json > tmp.json
                mv tmp.json package.json
            """

            sh 'git add package.json'
            sh "git commit -m 'Bump version to ${NEW_VERSION}'"

            // Push de la rama release usando la credencial SSH
            withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
                sh """
                    set -e
                    eval \$(ssh-agent -s)
                    ssh-add \$SSH_KEY
                    git push origin ${RELEASE_BRANCH}
                """
            }
        }
      }
        }

        stage('Merge release into main') {
      steps {
        script {
          sh 'git checkout main'
          sh 'git pull origin main'

          sh "git merge --no-ff ${RELEASE_BRANCH} -m 'Merge release ${NEW_VERSION}'"

          // Push main usando credencial
          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin main
                        """
          }
        }
      }
        }

        stage('Tag release on main') {
      steps {
        script {
          sh "git tag -a v${NEW_VERSION} -m 'Release ${NEW_VERSION}'"
          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin v${NEW_VERSION}
                        """
          }
        }
      }
        }

        stage('Merge back to develop') {
      steps {
        script {
          sh 'git checkout develop'
          sh 'git pull origin develop'

          sh "git merge --no-ff ${RELEASE_BRANCH} -m 'Merge release ${NEW_VERSION} back to develop'"

          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin develop
                        """
          }
        }
      }
        }

        stage('Delete release branch') {
      steps {
        script {
          withCredentials([sshUserPrivateKey(credentialsId: 'sierrapablo', keyFileVariable: 'SSH_KEY')]) {
            sh """
                            eval \$(ssh-agent -s)
                            ssh-add \$SSH_KEY
                            git push origin --delete ${RELEASE_BRANCH}
                        """
          }
        }
      }
        }
    }
}
