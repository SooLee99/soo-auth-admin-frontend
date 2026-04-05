# 서버 배포 가이드 (Docker)

본 프로젝트는 Docker를 사용하여 Nginx 환경에서 배포하도록 구성되어 있습니다.

## 1. 서버에서 직접 배포 (Manual Deployment)

새로운 서버에서 아래 명령어를 순차적으로 실행하여 프로젝트를 빌드하고 컨테이너를 실행합니다.

```bash
# 1. 프로젝트 복제
git clone <repository-url>
cd auth-admin-frontend

# 2. Docker 이미지 빌드
docker build -t auth-admin-frontend .

# 3. Docker 컨테이너 실행
# 외부 80포트를 컨테이너 80포트에 연결합니다.
docker run -d -p 80:80 --name auth-admin-container auth-admin-frontend
```

### 주의 사항
- `nginx.conf` 파일 내의 `proxy_pass http://backend-service:8080/api/;` 부분은 실제 백엔드 서버의 주소(IP 또는 도커 서비스명)에 맞게 수정이 필요할 수 있습니다.
- 빌드 전 수정한 뒤 다시 `docker build`를 진행해 주세요.

---

## 2. 도커 허브(Docker Hub)를 활용한 이미지 기반 배포 (추천)

서버에서 직접 소스 코드를 `git clone` 하지 않아도 됩니다. 개발 PC에서 빌드한 이미지를 도커 허브에 올리고(Push), 서버에서 그 이미지를 내려받아(Pull) 실행하는 방식입니다.

### 2.1 개발 PC에서 이미지 푸시 (Push)
```bash
# 1. 도커 허브 로그인
docker login

# 2. 이미지 빌드 (사용자계정명/이미지명:태그)
docker build -t <dockerhub-username>/auth-admin-frontend:latest .

# 3. 도커 허브로 이미지 전송
docker push <dockerhub-username>/auth-admin-frontend:latest
```

### 2.2 서버에서 이미지 풀 및 실행 (Pull & Run)
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

## 3. 사전 준비 사항
1. **Docker Registry**: Docker Hub 또는 AWS ECR, Github Packages 등의 컨테이너 레지스트리가 필요합니다.
