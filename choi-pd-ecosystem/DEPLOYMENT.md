# Deployment Guide

## 서버 정보
- **서버 IP**: 58.255.113.125
- **애플리케이션 포트**: 3011
- **웹 서버**: Nginx (리버스 프록시)
- **프로세스 관리**: systemd

## 포트 할당 정보
- **3011**: imPD Next.js 애플리케이션 (메인)
- **80**: HTTP (Nginx)
- **443**: HTTPS (Nginx with SSL)

## 배포 단계

### 1. 서버 환경 준비

```bash
# Node.js 설치 (v20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (선택사항, systemd 대신 사용 가능)
sudo npm install -g pm2

# Git 설치
sudo apt-get install git

# Nginx 설치
sudo apt-get install nginx
```

### 2. 프로젝트 클론 및 설정

```bash
# 애플리케이션 디렉토리 생성
sudo mkdir -p /var/www/impd
sudo chown -R $USER:$USER /var/www/impd

# 프로젝트 클론
cd /var/www/impd
git clone https://github.com/yourusername/choi-pd-ecosystem.git
cd choi-pd-ecosystem

# 환경 변수 설정
cp .env.production.example .env.production
nano .env.production
# 필요한 환경 변수 입력 (Clerk API keys, Database URL 등)

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 데이터베이스 마이그레이션
npm run db:push
npm run db:seed  # 초기 데이터가 필요한 경우
```

### 3. Nginx 설정

```bash
# Nginx 설정 파일 복사
sudo cp /var/www/impd/choi-pd-ecosystem/nginx.conf /etc/nginx/sites-available/impd
sudo ln -s /etc/nginx/sites-available/impd /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 4. systemd 서비스 설정

```bash
# 서비스 파일 복사
sudo cp /var/www/impd/choi-pd-ecosystem/impd.service /etc/systemd/system/

# systemd 리로드
sudo systemctl daemon-reload

# 서비스 활성화 및 시작
sudo systemctl enable impd
sudo systemctl start impd

# 서비스 상태 확인
sudo systemctl status impd
```

### 5. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d impd.co.kr -d www.impd.co.kr

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 6. 방화벽 설정

```bash
# UFW 방화벽 활성화
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## PM2로 배포 (systemd 대안)

systemd 대신 PM2를 사용하려는 경우:

```bash
# PM2 ecosystem 파일 생성
pm2 init ecosystem.config.js

# ecosystem.config.js 편집
module.exports = {
  apps: [{
    name: 'impd',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/impd/choi-pd-ecosystem',
    env: {
      NODE_ENV: 'production',
      PORT: 3011
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js

# PM2 시작 스크립트 저장
pm2 save
pm2 startup systemd
```

## 배포 후 검증

### 1. 애플리케이션 상태 확인

```bash
# systemd 사용 시
sudo systemctl status impd
sudo journalctl -u impd -f

# PM2 사용 시
pm2 status
pm2 logs impd
```

### 2. Nginx 로그 확인

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. 포트 확인

```bash
sudo netstat -tlnp | grep 3011
```

### 4. 웹사이트 접속 테스트

```bash
# 로컬에서 테스트
curl http://localhost:3011

# 외부에서 테스트
curl http://58.255.113.125
```

## 업데이트 배포

```bash
cd /var/www/impd/choi-pd-ecosystem

# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install

# 빌드
npm run build

# 데이터베이스 마이그레이션 (필요 시)
npm run db:push

# 서비스 재시작
sudo systemctl restart impd
# 또는 PM2 사용 시
pm2 restart impd
```

## 롤백 절차

문제 발생 시 이전 버전으로 롤백:

```bash
# 이전 커밋으로 되돌리기
git log --oneline -10  # 최근 10개 커밋 확인
git checkout <previous-commit-hash>

# 재빌드 및 재시작
npm install
npm run build
sudo systemctl restart impd
```

## 모니터링

### 1. 리소스 모니터링

```bash
# CPU 및 메모리 사용량
htop

# 디스크 사용량
df -h
```

### 2. 애플리케이션 로그

```bash
# systemd 로그
sudo journalctl -u impd --since "1 hour ago"

# PM2 로그
pm2 logs --lines 100
```

### 3. 데이터베이스 백업

```bash
# SQLite 데이터베이스 백업
sqlite3 /var/www/impd/choi-pd-ecosystem/data.db ".backup '/backup/impd_backup_$(date +%Y%m%d).db'"
```

## 트러블슈팅

### 포트 충돌 문제

```bash
# 3011 포트 사용 중인 프로세스 확인
sudo lsof -i :3011

# 프로세스 종료
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway 오류

```bash
# 애플리케이션이 실행 중인지 확인
sudo systemctl status impd

# 로그 확인
sudo journalctl -u impd -n 50
```

### 메모리 부족 문제

```bash
# 스왑 파일 생성 (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 보안 권장사항

1. **환경 변수 보안**: .env 파일 권한 설정
   ```bash
   chmod 600 .env.production
   ```

2. **정기 업데이트**: 의존성 및 시스템 패키지 업데이트
   ```bash
   npm audit fix
   sudo apt-get update && sudo apt-get upgrade
   ```

3. **백업 자동화**: crontab을 사용한 정기 백업
   ```bash
   0 2 * * * sqlite3 /var/www/impd/choi-pd-ecosystem/data.db ".backup '/backup/impd_backup_$(date +\%Y\%m\%d).db'"
   ```

4. **로그 로테이션**: logrotate 설정으로 로그 파일 관리
