# 🚀 Vercel 빠른 설정 가이드

## 현재 확인된 정보
- **Project ID**: `prj_ERxaoDXSS84hs3BRj2ZrSeT5tyYi`
- **Project Name**: `choi-pd-ecosystem`
- **GitHub Repo**: `myaji35/08_choi-pd-ecosystem`

## 📋 필수 작업 (3단계)

### 1️⃣ Vercel Token 생성
1. 👉 **[Vercel Tokens 페이지 열기](https://vercel.com/account/tokens)**
2. **"Create Token"** 클릭
3. 설정:
   - Name: `github-actions`
   - Scope: **Full Access**
4. **생성된 토큰 복사** (한 번만 표시됨!)

### 2️⃣ GitHub Secrets 추가
1. 👉 **[GitHub Secrets 페이지 열기](https://github.com/myaji35/08_choi-pd-ecosystem/settings/secrets/actions)**
2. **"New repository secret"** 클릭하여 3개 추가:

| Secret Name | Value |
|------------|-------|
| `VERCEL_TOKEN` | 위에서 복사한 토큰 |
| `VERCEL_PROJECT_ID` | `prj_ERxaoDXSS84hs3BRj2ZrSeT5tyYi` |
| `VERCEL_ORG_ID` | 아래에서 확인 |

#### Vercel Org ID 확인 방법:
- **개인 계정**: Vercel 대시보드 URL에서 확인
  - 예: `https://vercel.com/myaji355` → `myaji355`가 Org ID
- **팀 계정**: Team Settings에서 확인

### 3️⃣ Vercel 환경 변수 설정
1. 👉 **[Vercel 환경 변수 페이지](https://vercel.com/myaji355-projects/choi-pd-ecosystem/settings/environment-variables)**
2. 다음 변수들 추가:

```env
# 필수 변수
DATABASE_URL=file:./data/database.db
NEXT_PUBLIC_APP_URL=https://choi-pd-ecosystem.vercel.app

# Clerk 인증 (https://clerk.com에서 키 발급)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# 보안 키 (32자 이상 랜덤 문자열)
ENCRYPTION_KEY=your-super-secret-key-minimum-32-characters

# 개발 모드
NEXT_PUBLIC_DEV_MODE=false
```

## ⚡ 자동 설정 스크립트 실행

터미널에서 실행:

```bash
# 1. 프로젝트 디렉토리로 이동
cd "/Users/gangseungsig/Documents/02_GitHub/08_The Choi PD Ecosystem(최PD)"

# 2. 스크립트 실행
./setup-vercel-secrets.sh
```

## ✅ 설정 확인

### GitHub Actions 확인
```bash
# GitHub Secrets 목록 확인
gh secret list --repo=myaji35/08_choi-pd-ecosystem
```

### 배포 테스트
```bash
# main 브랜치에 push
git push origin main

# GitHub Actions 확인
open https://github.com/myaji35/08_choi-pd-ecosystem/actions
```

## 🎯 예상 결과

설정 완료 후:
1. **main 브랜치 push** → 자동 프로덕션 배포
2. **PR 생성** → 프리뷰 URL 자동 생성
3. **배포 URL**: `https://choi-pd-ecosystem.vercel.app`

## 🆘 문제 해결

### "Invalid token" 에러
- 새 토큰 생성 후 GitHub Secret 업데이트

### "Project not found" 에러
- Vercel 대시보드에서 프로젝트 확인
- Project ID가 정확한지 확인

### 빌드 실패
- Vercel 환경 변수 확인
- 특히 `DATABASE_URL`, `CLERK_SECRET_KEY` 설정 확인

## 📞 추가 도움

- [Vercel 문서](https://vercel.com/docs)
- [GitHub Actions 문서](https://docs.github.com/actions)
- [프로젝트 이슈](https://github.com/myaji35/08_choi-pd-ecosystem/issues)