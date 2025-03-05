node {
    stage('Build Frontend') {
        app = docker.build('backend-prod', "-f Dockerfile.prod .")
        
    }
    stage('Notify Deployment') {
        sh 'ssh localhost "jenkins-cli -s http://localhost:8080 build repo-infra -s"'
    }
}