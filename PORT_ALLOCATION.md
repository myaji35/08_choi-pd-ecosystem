# 포트 할당 문서

## 서버 정보
- **서버 IP**: 58.255.113.125
- **서버 OS**: Ubuntu/Linux
- **웹 서버**: Nginx (리버스 프록시)

## 포트 할당 현황

### 애플리케이션 포트
| 포트 | 서비스명 | 설명 | 상태 |
|------|----------|------|------|
| **3011** | imPD Main App | Next.js 메인 애플리케이션 | 할당됨 |
| 80 | HTTP | Nginx HTTP 서비스 | 시스템 |
| 443 | HTTPS | Nginx HTTPS 서비스 | 시스템 |

### 예약 포트 (향후 확장용)
| 포트 | 예정 서비스 | 설명 |
|------|------------|------|
| 3012 | API Server | 별도 API 서버 (필요시) |
| 3013 | Admin Panel | 독립 관리자 패널 (필요시) |
| 3014 | WebSocket | 실시간 통신 서버 (필요시) |
| 5432 | PostgreSQL | PostgreSQL 데이터베이스 (마이그레이션시) |
| 6379 | Redis | Redis 캐시 서버 (필요시) |

## Nginx 프록시 설정

### 기본 도메인 라우팅
```nginx
# 메인 도메인 → 포트 3011
server_name impd.co.kr www.impd.co.kr;
location / {
    proxy_pass http://localhost:3011;
}
```

### 서브도메인 라우팅 (향후)
```nginx
# API 서브도메인 (예정)
server_name api.impd.co.kr;
location / {
    proxy_pass http://localhost:3012;
}

# 관리자 서브도메인 (예정)
server_name admin.impd.co.kr;
location / {
    proxy_pass http://localhost:3013;
}
```

## 방화벽 규칙

### 현재 열린 포트
- **22**: SSH (관리자 접속용)
- **80**: HTTP
- **443**: HTTPS

### 내부 포트 (외부 직접 접근 차단)
- **3011**: Next.js 앱 (Nginx를 통해서만 접근)
- **3012-3014**: 예약 포트들 (로컬호스트만)

## 서비스 관리 명령어

### 포트 확인
```bash
# 특정 포트 사용 확인
sudo lsof -i :3011

# 모든 열린 포트 확인
sudo netstat -tlnp

# 포트 접근성 테스트
nc -zv localhost 3011
```

### 프로세스 관리
```bash
# systemd 서비스 상태
sudo systemctl status impd

# PM2 프로세스 상태
pm2 status

# 포트 사용 프로세스 종료
sudo kill -9 $(sudo lsof -t -i:3011)
```

## 로드밸런싱 설정 (향후 확장시)

여러 인스턴스 실행 시:
```nginx
upstream impd_backend {
    server localhost:3011;
    server localhost:3015;  # 추가 인스턴스
    server localhost:3016;  # 추가 인스턴스
}

server {
    location / {
        proxy_pass http://impd_backend;
    }
}
```

## 모니터링

### 포트 상태 모니터링
```bash
# 실시간 네트워크 연결 모니터링
watch -n 1 'netstat -an | grep :3011'

# 포트별 트래픽 모니터링
iftop -P -n -i any -f "port 3011"
```

### 헬스체크 엔드포인트
- **http://localhost:3011/api/health** - 애플리케이션 상태
- **http://58.255.113.125/nginx_status** - Nginx 상태 (설정 필요)

## 트러블슈팅

### 포트 충돌 해결
1. 현재 사용 중인 프로세스 확인
   ```bash
   sudo lsof -i :3011
   ```

2. 프로세스 종료
   ```bash
   sudo systemctl stop impd
   # 또는
   pm2 stop impd
   ```

3. 포트 변경 (필요시)
   - `package.json`의 start 스크립트 수정
   - nginx 설정 파일 수정
   - systemd 또는 PM2 설정 수정

### 포트 포워딩 설정
SSH 터널링으로 로컬 개발:
```bash
ssh -L 3011:localhost:3011 user@58.255.113.125
```

## 보안 고려사항

1. **애플리케이션 포트 직접 노출 금지**
   - 3011 포트는 방화벽에서 차단
   - Nginx를 통해서만 접근 허용

2. **Rate Limiting 설정**
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   location /api {
       limit_req zone=api burst=20;
       proxy_pass http://localhost:3011;
   }
   ```

3. **포트 스캐닝 방지**
   ```bash
   # fail2ban 설치 및 설정
   sudo apt-get install fail2ban
   ```