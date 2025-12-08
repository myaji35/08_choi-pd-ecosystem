# Vercel 배포 및 CI/CD 설정 가이드

## 🚀 개요
이 프로젝트는 **Vercel**을 통한 자동 배포와 **GitHub Actions**를 통한 CI/CD 파이프라인이 구성되어 있습니다.

## ✨ 주요 기능

### 자동 배포
- ✅ **Git Push 자동 배포**: main 브랜치 push 시 자동 프로덕션 배포
- ✅ **PR 프리뷰**: Pull Request마다 독립된 프리뷰 URL 생성
- ✅ **브랜치 배포**: develop 브랜치는 스테이징 환경으로 자동 배포

### CI/CD 파이프라인
- ✅ **코드 품질 검사**: ESLint, TypeScript 체크
- ✅ **자동 테스트**: 단위 테스트, E2E 테스트
- ✅ **보안 스캔**: 의존성 취약점 검사
- ✅ **성능 테스트**: Lighthouse 자동 실행

## 📋 초기 설정

### 1. Vercel 계정 설정

1. [Vercel](https://vercel.com) 가입/로그인
2. **Add New Project** 클릭
3. GitHub 리포지토리 연결: `myaji35/08_choi-pd-ecosystem`
4. Framework Preset: **Next.js** 선택
5. Root Directory: `choi-pd-ecosystem` 입력

### 2. 환경 변수 설정 (Vercel Dashboard)

Vercel 대시보드 → Settings → Environment Variables에서 추가:

```env
# 필수 환경 변수
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
DATABASE_URL=file:./data/database.db

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# 보안 키
ENCRYPTION_KEY=your-32-character-encryption-key-here

# 개발 모드
NEXT_PUBLIC_DEV_MODE=false
```

### 3. GitHub Secrets 설정

GitHub 리포지토리 → Settings → Secrets and variables → Actions에서 추가:

```yaml
VERCEL_TOKEN: [Vercel 설정에서 생성]
VERCEL_ORG_ID: [Vercel 대시보드에서 확인]
VERCEL_PROJECT_ID: [Vercel 프로젝트 설정에서 확인]
```

#### Vercel Token 생성 방법:
1. Vercel Dashboard → Settings → Tokens
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: github-actions)
4. Scope: Full Access 선택
5. 생성된 토큰을 GitHub Secrets에 추가

#### Vercel Organization/Project ID 확인:
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서
cd choi-pd-ecosystem
vercel link

# .vercel/project.json 파일에서 확인
cat .vercel/project.json
```

## 🔄 CI/CD 워크플로우

### GitHub Actions 워크플로우 단계

1. **코드 품질 검사** (quality-check)
   - ESLint 실행
   - TypeScript 타입 체크

2. **테스트** (test)
   - 단위 테스트 실행
   - 커버리지 리포트 생성
   - E2E 테스트 (Playwright)

3. **빌드** (build)
   - Next.js 프로덕션 빌드
   - 빌드 아티팩트 저장

4. **배포**
   - **PR**: 프리뷰 환경 배포
   - **main 브랜치**: 프로덕션 배포

5. **보안 스캔** (security-scan)
   - npm audit 실행
   - 의존성 체크

6. **성능 테스트** (lighthouse)
   - Core Web Vitals 측정
   - 접근성 검사

## 🌐 배포 URL 구조

### 프로덕션
- **메인 도메인**: `https://impd.vercel.app` (또는 커스텀 도메인)
- **배포 트리거**: main 브랜치 push

### 스테이징
- **URL**: `https://impd-develop.vercel.app`
- **배포 트리거**: develop 브랜치 push

### PR 프리뷰
- **URL 패턴**: `https://impd-pr-{번호}.vercel.app`
- **배포 트리거**: Pull Request 생성/업데이트
- **자동 삭제**: PR 머지/클로즈 시

## 🛠️ 로컬 개발 환경

### Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로컬 개발 서버 (Vercel 환경 변수 사용)
vercel dev

# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 📊 모니터링

### Vercel Analytics
- **Web Analytics**: 방문자 통계, 페이지 뷰
- **Speed Insights**: Core Web Vitals 모니터링
- **실시간 로그**: Functions 로그 확인

### GitHub Actions
- Actions 탭에서 워크플로우 상태 확인
- PR에 자동 코멘트로 배포 URL 알림
- 빌드 실패 시 이메일 알림

## 🔧 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
cd choi-pd-ecosystem
npm run build

# 환경 변수 확인
vercel env pull .env.local
```

### 배포 실패
1. Vercel 대시보드에서 로그 확인
2. 환경 변수 설정 확인
3. GitHub Secrets 확인

### 프리뷰 URL 접근 불가
1. PR 상태 확인
2. GitHub Actions 워크플로우 확인
3. Vercel 프로젝트 설정 확인

## 📝 커스텀 도메인 설정

1. Vercel Dashboard → Settings → Domains
2. Add Domain 클릭
3. 도메인 입력 (예: impd.co.kr)
4. DNS 설정:

```dns
# A Record (Apex domain)
Type: A
Name: @
Value: 76.76.21.21

# CNAME (www subdomain)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔐 보안 설정

### 환경 변수 보안
- Production과 Preview 환경 분리
- 민감한 정보는 Encrypted 설정
- GitHub Secrets로 CI/CD 보안

### 접근 제어
- Vercel Dashboard 2FA 활성화
- 팀 멤버 권한 관리
- Deployment Protection 설정

## 📈 성능 최적화

### 자동 최적화
- **이미지 최적화**: Next.js Image 컴포넌트
- **코드 스플리팅**: 자동 청크 분할
- **Edge Functions**: 지역별 엣지 배포
- **캐싱**: CDN 레벨 캐싱

### 모니터링
- Core Web Vitals 추적
- 실시간 성능 메트릭
- 에러 추적 및 알림

## 🚨 롤백 절차

### Vercel Dashboard
1. Deployments 탭 이동
2. 이전 성공 배포 선택
3. "Promote to Production" 클릭

### CLI 사용
```bash
# 배포 목록 확인
vercel list

# 특정 배포로 롤백
vercel rollback [deployment-url]
```

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Actions 문서](https://docs.github.com/actions)

## 🎯 체크리스트

- [ ] Vercel 계정 생성
- [ ] GitHub 리포지토리 연결
- [ ] 환경 변수 설정
- [ ] GitHub Secrets 추가
- [ ] 첫 배포 확인
- [ ] 커스텀 도메인 설정 (선택)
- [ ] 모니터링 설정

---
*최종 업데이트: 2024-12-08*