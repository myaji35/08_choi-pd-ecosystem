# Vercel 배포 설정 가이드

## 문제: '/admin' 로그인이 배포판에서 작동하지 않음

### 원인
Vercel 배포 시 `JWT_SECRET` 환경 변수가 설정되지 않아 JWT 토큰 생성/검증이 실패합니다.

### 해결 방법

#### 1. Vercel 대시보드에서 환경 변수 추가

**URL**: https://vercel.com/myaji35s-projects/choi-pd-ecosystem/settings/environment-variables

**추가할 환경 변수**:

| Key | Value | Environment |
|-----|-------|-------------|
| `JWT_SECRET` | `zSFH7W2wHGiD+c/iiTeQuDbEQbfP7NVyr4pEFl6YibM=` | Production, Preview, Development |
| `DATABASE_URL` | `file:./data/database.db` | All |
| `ENCRYPTION_KEY` | `j69qAzOY1tl0ids9KE2hcLli3/XcgEdq0olGDcG3JR4=` | All |

#### 2. 환경 변수 추가 단계

1. Vercel 프로젝트 페이지 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Environment Variables** 클릭
4. 각 환경 변수 추가:
   - **Key** 입력: `JWT_SECRET`
   - **Value** 입력: `zSFH7W2wHGiD+c/iiTeQuDbEQbfP7NVyr4pEFl6YibM=`
   - **Environment** 선택: `Production`, `Preview`, `Development` 모두 체크
   - **Add** 버튼 클릭

5. 모든 환경 변수 추가 완료 후 **Redeploy** 필요

#### 3. 재배포

환경 변수 추가 후:

**방법 A - Vercel 대시보드에서**:
1. **Deployments** 탭 클릭
2. 최신 배포의 **...** 메뉴 클릭
3. **Redeploy** 선택

**방법 B - CLI에서**:
```bash
cd choi-pd-ecosystem
npx vercel --prod
```

#### 4. 확인

재배포 완료 후:

1. 배포 URL 접속: https://choi-pd-ecosystem-4sjdw71ta-myaji35s-projects.vercel.app/admin/login
2. 테스트 계정으로 로그인 시도
3. 정상 작동 확인

---

## 추가 설정 (선택 사항)

### 커스텀 도메인 연결

1. Vercel 대시보드 → **Settings** → **Domains**
2. 도메인 추가 (예: admin.choi-pd.com)
3. DNS 설정 업데이트

### 데이터베이스 마이그레이션 (Vercel Postgres로 전환)

현재는 파일 기반 SQLite를 사용하지만, 프로덕션 환경에서는 Vercel Postgres 권장:

```bash
# Vercel Postgres 추가
vercel link
vercel env pull
```

---

## 트러블슈팅

### 문제: 환경 변수 추가 후에도 로그인 안됨

**해결책**:
1. Vercel 대시보드에서 환경 변수가 올바르게 추가되었는지 확인
2. 반드시 **Redeploy** 실행 (환경 변수는 재배포 시에만 적용됨)
3. 브라우저 캐시 삭제 후 재시도

### 문제: "Invalid token" 에러

**해결책**:
1. JWT_SECRET이 production, preview, development 모두에 동일한 값으로 설정되었는지 확인
2. 쿠키 삭제 후 재로그인

---

**작성일**: 2025-11-19
**최종 업데이트**: 2025-11-19
