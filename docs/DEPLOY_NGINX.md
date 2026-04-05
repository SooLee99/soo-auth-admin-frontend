# 기존 서버 Nginx 설정과 통합하는 방법 (HTTPS/Proxy)

기존 서버에서 이미 Nginx를 사용 중이고 HTTPS(`443`) 설정을 사용하고 있다면, 아래 설정을 기존 Nginx 설정 파일에 추가하여 프론트엔드와 통합할 수 있습니다.

## 1. 기존 서버 Nginx 설정 수정 예시

기존의 백엔드 설정(`location /`)은 유지하면서, `/admin` 경로로 들어오는 요청만 프론트엔드 컨테이너로 전달하도록 설정합니다.

```nginx
server {
    listen 443 ssl http2;
    server_name auth.soo.it.kr www.auth.soo.it.kr;

    # 기존 SSL 설정 유지...
    ssl_certificate /etc/nginx/ssl/www.soo.it.kr_fullchain.crt;
    ssl_certificate_key /etc/nginx/ssl/www_soo.it.kr.key;

    # [추가] 프론트엔드 관리자 페이지 설정
    location /admin/ {
        # 프론트엔드 도커 컨테이너의 서비스명(또는 IP)과 포트(80)를 입력하세요.
        proxy_pass http://auth-admin-container:80/admin/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 기존 백엔드 설정 유지
    location / {
        proxy_pass http://app:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 2. 도커 네트워크 구성 주의사항

기존 Nginx 컨테이너와 새로운 프론트엔드 컨테이너가 서로 통신하려면 동일한 **Docker Network**에 있어야 합니다.
- 기존 네트워크가 `my-network`라면, 프론트엔드 컨테이너를 실행할 때 `--network my-network` 옵션을 추가하세요.
- `proxy_pass http://auth-admin-container:80/admin/;`에서 `auth-admin-container` 부분은 실제 실행한 컨테이너의 `--name`과 일치해야 합니다.
