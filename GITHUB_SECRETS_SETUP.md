# 🔐 GitHub Secrets 설정 가이드

## 📅 자동 배포 설정 완료!

**매일 한국시간 자정(00:00)에 자동으로 GCP 서버에 배포됩니다.**

## 🔑 필수 GitHub Secrets 설정

GitHub 리포지토리 설정에서 다음 Secrets를 추가해야 합니다:

### 1. GitHub 웹사이트에서 설정하기

1. **GitHub 리포지토리 페이지 접속**
   ```
   https://github.com/[username]/[repository-name]/settings/secrets/actions
   ```

2. **"New repository secret" 클릭**

3. **다음 Secrets 추가:**

| Secret 이름 | 설명 | 예시 값 |
|------------|------|---------|
| `GCP_USER` | GCP 서버 사용자명 | `your-username` |
| `GCP_SSH_PRIVATE_KEY` | SSH 개인키 (전체 내용) | `-----BEGIN RSA PRIVATE KEY-----...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | `sk_live_...` |
| `ENCRYPTION_KEY` | 32자 암호화 키 | `your32characterencryptionkeyhere` |

### 2. GitHub CLI로 설정하기 (선택)

```bash
# GitHub CLI 설치 (Mac)
brew install gh

# 로그인
gh auth login

# Secrets 설정
gh secret set GCP_USER --body="your-username"
gh secret set GCP_SSH_PRIVATE_KEY < ~/.ssh/id_rsa
gh secret set CLERK_PUBLISHABLE_KEY --body="pk_live_..."
gh secret set CLERK_SECRET_KEY --body="sk_live_..."
gh secret set ENCRYPTION_KEY --body="your32characterencryptionkeyhere"
```

## 🔑 SSH 키 생성 방법

### 로컬에서 SSH 키 생성
```bash
# SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/gcp_deploy_key

# 공개키 내용 복사
cat ~/.ssh/gcp_deploy_key.pub
```

### GCP 서버에 공개키 추가
```bash
# GCP 서버 접속
ssh [username]@34.64.191.91

# authorized_keys에 공개키 추가
echo "ssh-rsa AAAA... your-email@example.com" >> ~/.ssh/authorized_keys

# 권한 설정
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### GitHub Secret에 개인키 추가
```bash
# 개인키 내용 복사 (이것을 GCP_SSH_PRIVATE_KEY Secret에 추가)
cat ~/.ssh/gcp_deploy_key
```

## ⏰ 배포 스케줄

- **자동 배포**: 매일 한국시간 자정 (00:00 KST)
- **수동 배포**: GitHub Actions 페이지에서 "Run workflow" 클릭

### 스케줄 변경 방법

`.github/workflows/scheduled-deploy.yml` 파일의 cron 값 수정:

```yaml
schedule:
  - cron: '0 15 * * *'  # UTC 15:00 = KST 00:00 (자정)
```

다른 시간 예시:
- `'0 21 * * *'` - 한국시간 오전 6시
- `'0 3 * * *'` - 한국시간 오후 12시
- `'0 9 * * *'` - 한국시간 오후 6시

## 🚀 수동 배포 방법

1. **GitHub Actions 페이지 접속**
   ```
   https://github.com/[username]/[repository-name]/actions
   ```

2. **"Scheduled GCP Deployment" 워크플로우 선택**

3. **"Run workflow" 버튼 클릭**

4. **Environment 선택 (production/staging)**

5. **"Run workflow" 확인**

## ✅ 설정 확인

모든 Secrets가 설정되었는지 확인:

```bash
# GitHub CLI로 확인
gh secret list
```

결과:
```
CLERK_PUBLISHABLE_KEY  Updated 2025-12-08
CLERK_SECRET_KEY       Updated 2025-12-08
ENCRYPTION_KEY         Updated 2025-12-08
GCP_SSH_PRIVATE_KEY    Updated 2025-12-08
GCP_USER              Updated 2025-12-08
```

## 📊 배포 모니터링

### 배포 상태 확인
- GitHub Actions 탭에서 실시간 로그 확인
- 각 단계별 진행 상황 모니터링

### 서버 로그 확인
```bash
# GCP 서버 접속 후
pm2 logs impd-ecosystem --lines 100
```

### 헬스 체크
```bash
curl http://34.64.191.91:8000/api/health
```

## 🔧 문제 해결

### SSH 연결 실패
- SSH 키 권한 확인: `chmod 600 ~/.ssh/id_rsa`
- GCP 방화벽에서 22번 포트 열려있는지 확인

### 빌드 실패
- Node.js 버전 확인 (18.x 필요)
- package-lock.json 파일 존재 확인

### PM2 시작 실패
- 서버에 PM2 설치 확인: `pm2 --version`
- 포트 8000 사용 중인지 확인: `sudo lsof -i :8000`

## 🎉 완료!

모든 설정이 완료되면:
- ✅ 매일 자정에 자동 배포
- ✅ GitHub에서 수동 배포 가능
- ✅ 배포 상태 실시간 모니터링

---
*Created: 2025-12-08 23:20 KST*
*Auto-deploy: Every day at 00:00 KST*
*Manual deploy: Available anytime via GitHub Actions*