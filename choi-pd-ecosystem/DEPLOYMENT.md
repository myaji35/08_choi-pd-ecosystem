# 배포 가이드

최범희 PD 브랜드 허브 웹사이트 배포 가이드입니다.

## 목차
- [사전 준비](#사전-준비)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 준비](#데이터베이스-준비)
- [프로덕션 빌드](#프로덕션-빌드)
- [배포 방법](#배포-방법)
  - [Vercel 배포 (권장)](#vercel-배포-권장)
  - [Docker 배포](#docker-배포)
  - [VPS 배포](#vps-배포)
- [배포 후 확인사항](#배포-후-확인사항)

---

## 사전 준비

### 필수 요구사항
- Node.js 18.18.0 이상
- npm 또는 pnpm
- Clerk 계정 및 API 키
- SQLite 데이터베이스 (LibSQL)

### 설치된 주요 패키지
```json
{
  "next": "^16.0.1",
  "react": "^19.0.0",
  "@clerk/nextjs": "^6.14.7",
  "drizzle-orm": "^0.38.3",
  "@libsql/client": "^0.15.0"
}
```

---

## 환경 변수 설정

### 프로덕션 환경 변수 (.env.production)

프로덕션 환경에서는 `.env.production` 파일을 생성하고 다음 변수들을 설정해야 합니다:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
CLERK_SECRET_KEY=sk_live_your_secret_key

# Database
DATABASE_URL=file:./data/database.db

# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 환경별 변수 우선순위
1. `.env.production` (프로덕션 전용)
2. `.env.local` (모든 환경, Git 무시됨)
3. `.env` (기본값)

---

## 데이터베이스 준비

### 1. 프로덕션 데이터베이스 초기화

```bash
# 데이터베이스 디렉토리 생성
mkdir -p data

# 스키마 적용
npm run db:push
```

### 2. 초기 데이터 입력

```bash
# 샘플 데이터 시드 (선택사항)
npm run db:seed
```

### 3. 데이터베이스 백업 설정

프로덕션에서는 정기적인 백업이 필수입니다:

```bash
# 백업 스크립트 예시
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp ./data/database.db "$BACKUP_DIR/database_$DATE.db"
```

---

## 프로덕션 빌드

### 1. 빌드 실행

```bash
npm run build
```

### 2. 빌드 검증

빌드가 성공하면 다음과 같은 출력을 확인할 수 있습니다:

```
Route (app)           Revalidate  Expire
┌ ○ /                        10m      1y
├ ○ /_not-found
├ ƒ /api/courses
├ ƒ /api/inquiries
├ ○ /education
├ ○ /media
└ ○ /media/greeting
```

- `○` (Static): 정적으로 미리 렌더링된 페이지
- `ƒ` (Dynamic): 요청 시 서버 렌더링되는 페이지
- `Revalidate 10m`: 10분마다 ISR로 재생성

### 3. 로컬에서 프로덕션 테스트

```bash
npm run start
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

---

## 배포 방법

### Vercel 배포 (권장)

Vercel은 Next.js를 만든 회사의 플랫폼으로 가장 간단하고 최적화된 배포 방법입니다.

#### 1. Vercel CLI 설치

```bash
npm i -g vercel
```

#### 2. 로그인

```bash
vercel login
```

#### 3. 프로젝트 배포

```bash
# 첫 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 4. 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 위에서 언급한 환경 변수들을 추가

#### 5. 데이터베이스 설정

**중요**: SQLite는 Vercel의 서버리스 환경에서 제한적입니다. 프로덕션에서는 다음 옵션을 고려하세요:

**옵션 1: Turso (LibSQL 클라우드)**
```bash
# Turso 설치
curl -sSfL https://get.tur.so/install.sh | bash

# 데이터베이스 생성
turso db create choi-pd-ecosystem

# 연결 URL 확인
turso db show choi-pd-ecosystem --url
```

`.env.production` 업데이트:
```bash
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-auth-token
```

`src/lib/db/index.ts` 업데이트:
```typescript
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
```

**옵션 2: Vercel Postgres**
```bash
npm install @vercel/postgres
```

스키마를 Postgres로 마이그레이션해야 합니다.

---

### Docker 배포

#### 1. Dockerfile 생성

프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. next.config.ts 수정

Standalone 빌드 활성화:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

#### 3. .dockerignore 생성

```
node_modules
.next
.env*.local
*.log
.git
```

#### 4. Docker 이미지 빌드 및 실행

```bash
# 이미지 빌드
docker build -t choi-pd-ecosystem .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key \
  -e CLERK_SECRET_KEY=your_secret \
  -v $(pwd)/data:/app/data \
  choi-pd-ecosystem
```

#### 5. Docker Compose (선택사항)

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - DATABASE_URL=file:./data/database.db
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

실행:
```bash
docker-compose up -d
```

---

### VPS 배포

Ubuntu/Debian 기반 VPS에 배포하는 방법입니다.

#### 1. 서버 준비

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 설치 (프로세스 관리자)
sudo npm install -g pm2
```

#### 2. 프로젝트 배포

```bash
# Git clone
git clone https://github.com/your-repo/choi-pd-ecosystem.git
cd choi-pd-ecosystem

# 의존성 설치
npm ci

# 환경 변수 설정
cp .env.example .env.production
nano .env.production  # 환경 변수 입력

# 데이터베이스 초기화
mkdir -p data
npm run db:push
npm run db:seed  # 선택사항

# 빌드
npm run build
```

#### 3. PM2로 실행

```bash
# PM2 ecosystem 파일 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'choi-pd-ecosystem',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# PM2로 시작
pm2 start ecosystem.config.js

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### 4. Nginx 리버스 프록시 설정

```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/choi-pd-ecosystem
```

설정 내용:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

활성화:

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/choi-pd-ecosystem /etc/nginx/sites-enabled/

# Nginx 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 확인
sudo certbot renew --dry-run
```

---

## 배포 후 확인사항

### 1. 기능 테스트 체크리스트

- [ ] 홈페이지 로딩 확인
- [ ] 교육 페이지 및 필터링 동작 확인
- [ ] 미디어 페이지 확인
- [ ] 문의하기 폼 제출 테스트
- [ ] Clerk 인증 (로그인/로그아웃) 테스트
- [ ] API 엔드포인트 확인 (/api/courses, /api/inquiries)
- [ ] 모바일 반응형 확인
- [ ] 다크모드 확인 (구현된 경우)

### 2. 성능 확인

```bash
# Lighthouse 점수 확인
npx lighthouse https://yourdomain.com --view

# 페이지 로드 속도 확인
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com
```

### 3. 모니터링 설정

#### Vercel 사용 시
- Vercel Analytics 활성화
- Real-time logs 확인

#### 자체 호스팅 시
```bash
# PM2 모니터링
pm2 monit

# 로그 확인
pm2 logs choi-pd-ecosystem

# 상태 확인
pm2 status
```

### 4. 백업 자동화

```bash
# Crontab 설정
crontab -e

# 매일 새벽 2시에 백업
0 2 * * * /path/to/backup-script.sh
```

---

## 문제 해결

### 빌드 실패

```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

### 데이터베이스 연결 오류

```bash
# 권한 확인
ls -la data/database.db

# 권한 수정
chmod 664 data/database.db
```

### Clerk 인증 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Clerk 대시보드에서 도메인이 허용 목록에 있는지 확인

### 메모리 부족

```bash
# Node.js 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 추가 참고사항

### 프로덕션 최적화

1. **이미지 최적화**: Next.js Image 컴포넌트 사용
2. **코드 스플리팅**: 자동으로 처리됨
3. **ISR 설정**: 현재 10분 (필요시 조정)
4. **캐싱 전략**: Nginx 또는 CDN 레벨에서 추가 캐싱

### 보안 체크리스트

- [ ] 환경 변수 파일 (.env) Git에 커밋되지 않도록 확인
- [ ] HTTPS 사용
- [ ] CORS 설정 확인
- [ ] Rate limiting 적용 고려
- [ ] Clerk 보안 설정 검토

### 유지보수

```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 보안 패치 적용
npm audit fix
```

---

## 지원

배포 관련 문제가 발생하면:
1. PROGRESS.md에서 현재 상태 확인
2. 로그 파일 확인
3. GitHub Issues 또는 관리자에게 문의

**배포 성공을 기원합니다!**
