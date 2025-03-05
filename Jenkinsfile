pipeline {
    agent any
    stages {
        stage('Build Frontend') {
            steps {
                sh 'docker build -f Dockerfile.prod -t backend-prod .'
            }
        }
        stage('Notify Deployment') {
            steps {
                sh 'ssh localhost "jenkins-cli -s http://localhost:8080 build repo-infra -s"'
            }
        }
    }
}