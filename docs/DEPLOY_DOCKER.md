# 서버 배포 가이드 (Docker)

본 프로젝트는 Docker를 사용하여 Nginx 환경에서 배포하도록 구성되어 있습니다.

## 1. 배포 방식 (Docker Hub 이미지 기반)

서버에서는 소스 코드를 `git clone` 하거나 `docker build` 하지 않습니다.
이미지는 개발 PC 또는 CI/CD에서 빌드/푸시하고, 서버에서는 Docker Hub에서 이미지를 `pull` 받아 실행합니다.

## 2. 개발 PC(또는 CI)에서 이미지 푸시 (Push)

```bash
# 1. 도커 허브 로그인
docker login

# 2. 이미지 빌드 (사용자계정명/이미지명:태그)
docker build -t <dockerhub-username>/auth-admin-frontend:latest .

# 3. 도커 허브로 이미지 전송
docker push <dockerhub-username>/auth-admin-frontend:latest
```

## 3. 서버에서 이미지 풀 및 실행 (Pull & Run)
서버에는 Docker만 설치되어 있으면 됩니다. 소스 코드는 필요하지 않습니다.

```bash
# 1. 최신 이미지 내려받기
docker pull <dockerhub-username>/auth-admin-frontend:latest

# 2. 기존 컨테이너 중지 및 삭제 (있을 경우)
docker stop auth-admin-container || true
docker rm auth-admin-container || true

# 3. 새 컨테이너 실행
docker run -d -p 80:80 --name auth-admin-container <dockerhub-username>/auth-admin-frontend:latest
```

---

## 4. 사전 준비 사항
1. **Docker Registry**: Docker Hub 또는 AWS ECR, Github Packages 등의 컨테이너 레지스트리가 필요합니다.
2. **Nginx 설정 확인**: `nginx.conf`의 `proxy_pass http://backend-service:8080/api/;`는 실제 백엔드 주소(도커 서비스명 또는 IP)로 맞춰야 합니다.
