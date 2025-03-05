node {
    stage('Build Frontend') {
        steps {
            app = docker.build('backend-prod', "-f Dockerfile.prod .")
        }
    }
    stage('Notify Deployment') {
        steps {
            sh 'ssh localhost "jenkins-cli -s http://localhost:8080 build repo-infra -s"'
        }
    }
}