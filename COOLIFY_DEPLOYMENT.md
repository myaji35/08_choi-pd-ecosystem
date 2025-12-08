# Coolify 자동 배포 설정 가이드

## Coolify란?
Coolify는 오픈소스 self-hosted PaaS(Platform as a Service)로, Heroku/Netlify/Vercel의 대안입니다.
Git 기반 자동 배포, Docker 컨테이너 관리, SSL 자동 설정 등을 지원합니다.

## 🎯 Coolify 자동 배포 기능

### 지원하는 자동 배포 기능
- ✅ **Git Push 자동 배포** (Webhook)
- ✅ **브랜치별 독립 환경**
- ✅ **PR Preview 환경**
- ✅ **자동 SSL 인증서** (Let's Encrypt)
- ✅ **환경 변수 관리**
- ✅ **자동 헬스체크 & 재시작**
- ✅ **빌드 로그 실시간 확인**
- ✅ **롤백 기능**

## 📋 사전 준비 사항

1. **Coolify 설치** (서버: 58.255.113.125)
```bash
# Coolify 설치 (Docker 필요)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

2. **GitHub Repository**: https://github.com/myaji35/08_choi-pd-ecosystem.git

## 🔧 Coolify 프로젝트 설정

### 1. Coolify 대시보드 접속
```
http://58.255.113.125:8000
```

### 2. 새 프로젝트 생성

1. **Projects** → **+ New Project**
2. 프로젝트 이름: `imPD Platform`

### 3. 새 애플리케이션 추가

1. **+ New Resource** → **Application**
2. **Public Repository** 선택
3. Repository URL 입력:
   ```
   https://github.com/myaji35/08_choi-pd-ecosystem.git
   ```

### 4. 애플리케이션 설정

#### 기본 설정
```yaml
Name: impd-nextjs
Branch: main
Build Pack: Node.js
Port: 3011
```

#### 빌드 설정
```yaml
Base Directory: /choi-pd-ecosystem
Build Command: npm install && npm run build
Start Command: npm start
```

#### Node.js 버전 설정
```yaml
Node Version: 20-alpine
```

### 5. 환경 변수 설정

Coolify 대시보드에서 환경 변수 추가:

```env
# Production Environment Variables
NODE_ENV=production
PORT=3011

# Database
DATABASE_URL=file:./data/database.db

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# App URL
NEXT_PUBLIC_APP_URL=http://58.255.113.125

# Encryption Key
ENCRYPTION_KEY=your-32-character-encryption-key

# Development Mode (production에서는 false)
NEXT_PUBLIC_DEV_MODE=false
```

### 6. 자동 배포 Webhook 설정

#### GitHub Webhook 추가

1. GitHub Repository → Settings → Webhooks → Add webhook
2. Coolify에서 제공하는 Webhook URL 복사:
   ```
   http://58.255.113.125:8000/webhooks/github/[generated-id]
   ```
3. GitHub Webhook 설정:
   - **Payload URL**: 위에서 복사한 URL
   - **Content type**: `application/json`
   - **Secret**: Coolify에서 생성된 시크릿 키
   - **Events**: `Push events` 선택

### 7. 도메인 및 SSL 설정

#### 도메인 연결
```yaml
Domains: impd.co.kr,www.impd.co.kr
```

#### SSL 자동 설정
- Coolify가 Let's Encrypt를 통해 자동으로 SSL 인증서 발급
- HTTP → HTTPS 자동 리다이렉션

### 8. 고급 설정

#### Health Check
```yaml
Health Check Path: /api/health
Health Check Interval: 30s
Health Check Timeout: 10s
Health Check Retries: 3
```

#### 자동 재시작
```yaml
Restart Policy: unless-stopped
Max Restart Count: 10
```

#### 리소스 제한
```yaml
CPU Limit: 2
Memory Limit: 2GB
```

## 🚀 배포 프로세스

### 자동 배포 플로우
1. 개발자가 GitHub main 브랜치에 push
2. GitHub Webhook이 Coolify에 알림
3. Coolify가 자동으로 최신 코드 pull
4. Docker 이미지 빌드
5. 기존 컨테이너 중지
6. 새 컨테이너 시작
7. Health check 수행
8. 성공 시 트래픽 전환

### 수동 배포
Coolify 대시보드에서 **Deploy** 버튼 클릭

### 롤백
1. Deployments 탭으로 이동
2. 이전 성공 배포 선택
3. **Rollback** 버튼 클릭

## 📊 모니터링

### 실시간 로그
```bash
# Coolify 대시보드에서 확인
Applications → impd-nextjs → Logs
```

### 메트릭 확인
- CPU 사용률
- 메모리 사용률
- 네트워크 I/O
- 디스크 사용량

## 🔄 브랜치별 환경 설정

### Preview 환경 (PR별)
```yaml
Enable PR Previews: true
PR Preview Prefix: pr-
Delete Preview on PR Close: true
```

### 스테이징 환경
```yaml
Branch: develop
Domain: staging.impd.co.kr
Environment: staging
```

## 📝 Docker 설정 (선택사항)

프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY choi-pd-ecosystem/package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY choi-pd-ecosystem/package*.json ./
RUN npm ci
COPY choi-pd-ecosystem .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3011
ENV PORT 3011

CMD ["node", "server.js"]
```

## 🎯 장점

### Coolify vs 전통적인 배포
| 기능 | Coolify | 전통적 배포 |
|------|---------|------------|
| 자동 배포 | ✅ Webhook 자동 | ❌ 수동 SSH |
| SSL 인증서 | ✅ 자동 갱신 | ❌ 수동 설정 |
| 롤백 | ✅ 원클릭 | ❌ 수동 작업 |
| 환경 변수 | ✅ UI 관리 | ❌ 파일 편집 |
| 로그 확인 | ✅ 실시간 UI | ❌ SSH 필요 |
| PR Preview | ✅ 자동 생성 | ❌ 불가능 |
| 멀티 브랜치 | ✅ 쉬운 설정 | ❌ 복잡함 |

## 🛠️ 트러블슈팅

### 빌드 실패 시
1. 빌드 로그 확인
2. 환경 변수 확인
3. Node.js 버전 확인
4. 메모리 제한 증가

### 배포 후 502 에러
1. Health check 경로 확인
2. 포트 설정 확인
3. 애플리케이션 로그 확인

### Webhook 동작 안 함
1. GitHub Webhook 전송 기록 확인
2. Coolify Webhook URL 재확인
3. 네트워크 방화벽 확인

## 📚 추가 리소스

- [Coolify 공식 문서](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Coolify 디스코드](https://discord.gg/coolify)

## 🔐 보안 권장사항

1. **Coolify 대시보드 접근 제한**
   - 강력한 비밀번호 설정
   - 2FA 활성화
   - IP 화이트리스트

2. **환경 변수 보안**
   - 민감한 정보는 환경 변수로 관리
   - 절대 코드에 하드코딩 금지

3. **정기 업데이트**
   ```bash
   # Coolify 업데이트
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

---
*Last Updated: 2024-12-08*