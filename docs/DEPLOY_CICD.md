# 자동화 배포 (CI/CD) 가이드

본 프로젝트는 GitHub Actions를 사용하여 Docker 이미지를 자동으로 빌드하고 배포하도록 구성할 수 있습니다.

## 1. 자동화 흐름 예시 (GitHub Actions)

`.github/workflows/deploy.yml` 파일을 생성하여 아래와 같이 구성할 수 있습니다.

```yaml
name: CI/CD Deployment

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER__HUB_ACCESS_TOKEN }}

      - name: Build and Push Docker image
        run: |
          docker build -t ${{ secrets.DOCKER_HUB_USERNAME }}/auth-admin-frontend:latest .
          docker push ${{ secrets.DOCKER_HUB_USERNAME }}/auth-admin-frontend:latest

      - name: Deploy to Server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/auth-admin-frontend:latest
            docker stop auth-admin-container || true
            docker rm auth-admin-container || true
            docker run -d -p 80:80 --name auth-admin-container ${{ secrets.DOCKER_HUB_USERNAME }}/auth-admin-frontend:latest
```

## 2. 사전 준비 사항

**GitHub Secrets 설정**: `DOCKER_HUB_USERNAME`, `DOCKER_HUB_ACCESS_TOKEN`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` 등을 GitHub 저장소 설정에서 추가해야 합니다.
