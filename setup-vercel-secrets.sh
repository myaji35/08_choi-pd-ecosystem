#!/bin/bash

# Vercel 및 GitHub Secrets 설정 스크립트
# 이 스크립트는 Vercel 배포를 위한 모든 설정을 자동화합니다

echo "🚀 Vercel 자동 배포 설정 시작"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub Repository 정보
GITHUB_OWNER="myaji35"
GITHUB_REPO="08_choi-pd-ecosystem"

# Vercel Project 정보 (스크린샷에서 확인됨)
VERCEL_PROJECT_ID="prj_ERxaoDXSS84hs3BRj2ZrSeT5tyYi"

# 1. GitHub CLI 설치 확인
echo -e "${YELLOW}1. GitHub CLI 확인 중...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI가 설치되어 있지 않습니다.${NC}"
    echo "설치 방법:"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install --id GitHub.cli"
    echo "  Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    exit 1
fi
echo -e "${GREEN}✓ GitHub CLI 확인 완료${NC}"

# 2. GitHub 로그인 확인
echo -e "${YELLOW}2. GitHub 인증 확인 중...${NC}"
if ! gh auth status &> /dev/null; then
    echo "GitHub 로그인이 필요합니다."
    gh auth login
fi
echo -e "${GREEN}✓ GitHub 인증 완료${NC}"

# 3. Vercel CLI 설치 확인
echo -e "${YELLOW}3. Vercel CLI 확인 중...${NC}"
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI 설치 중..."
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI 확인 완료${NC}"

# 4. Vercel 로그인
echo -e "${YELLOW}4. Vercel 로그인 중...${NC}"
vercel login

# 5. Vercel Organization ID 가져오기
echo -e "${YELLOW}5. Vercel Organization ID 확인 중...${NC}"
VERCEL_ORG_ID=$(vercel whoami --token $(vercel whoami --show-token 2>/dev/null) 2>/dev/null | grep "ID:" | awk '{print $2}')

if [ -z "$VERCEL_ORG_ID" ]; then
    echo -e "${YELLOW}Organization ID를 자동으로 가져올 수 없습니다.${NC}"
    echo "수동으로 입력해주세요:"
    echo "1. https://vercel.com/account 접속"
    echo "2. Team 선택 (개인 계정이면 Settings)"
    echo "3. General 탭에서 Team ID 확인"
    read -p "Vercel Organization/Team ID: " VERCEL_ORG_ID
fi

echo -e "${GREEN}Organization ID: $VERCEL_ORG_ID${NC}"

# 6. Vercel Token 생성
echo -e "${YELLOW}6. Vercel API Token 생성${NC}"
echo "브라우저가 열립니다. 다음 단계를 따라주세요:"
echo "1. 'Create Token' 클릭"
echo "2. Token 이름: github-actions"
echo "3. Scope: Full Access 선택"
echo "4. 생성된 토큰 복사"
sleep 2

# 브라우저 열기
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://vercel.com/account/tokens"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "https://vercel.com/account/tokens"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start "https://vercel.com/account/tokens"
fi

echo ""
read -p "생성된 Vercel Token을 붙여넣으세요: " VERCEL_TOKEN

# 7. GitHub Secrets 설정
echo -e "${YELLOW}7. GitHub Secrets 설정 중...${NC}"

# VERCEL_TOKEN
echo "Setting VERCEL_TOKEN..."
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$GITHUB_OWNER/$GITHUB_REPO"

# VERCEL_ORG_ID
echo "Setting VERCEL_ORG_ID..."
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$GITHUB_OWNER/$GITHUB_REPO"

# VERCEL_PROJECT_ID
echo "Setting VERCEL_PROJECT_ID..."
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$GITHUB_OWNER/$GITHUB_REPO"

echo -e "${GREEN}✓ GitHub Secrets 설정 완료${NC}"

# 8. 설정 확인
echo ""
echo -e "${YELLOW}8. 설정 확인${NC}"
echo "================================"
echo -e "${GREEN}설정된 GitHub Secrets:${NC}"
gh secret list --repo="$GITHUB_OWNER/$GITHUB_REPO" | grep VERCEL

# 9. 프로젝트 연결
echo ""
echo -e "${YELLOW}9. Vercel 프로젝트 연결${NC}"
cd choi-pd-ecosystem 2>/dev/null || {
    echo -e "${RED}choi-pd-ecosystem 디렉토리를 찾을 수 없습니다.${NC}"
    echo "올바른 디렉토리에서 실행해주세요."
    exit 1
}

# Vercel 프로젝트 연결
vercel link --yes

# 10. 환경 변수 설정 안내
echo ""
echo -e "${YELLOW}10. Vercel 환경 변수 설정${NC}"
echo "================================"
echo "다음 URL에서 환경 변수를 설정하세요:"
echo -e "${GREEN}https://vercel.com/$VERCEL_ORG_ID/choi-pd-ecosystem/settings/environment-variables${NC}"
echo ""
echo "필수 환경 변수:"
echo "  - DATABASE_URL"
echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "  - CLERK_SECRET_KEY"
echo "  - ENCRYPTION_KEY"
echo "  - NEXT_PUBLIC_APP_URL"
echo ""

# 11. 배포 테스트
echo -e "${YELLOW}첫 배포를 시작하시겠습니까? (y/n)${NC}"
read -p "선택: " deploy_now

if [[ $deploy_now == "y" ]] || [[ $deploy_now == "Y" ]]; then
    echo "배포 시작..."
    vercel --prod
    echo -e "${GREEN}✅ 배포 완료!${NC}"
fi

# 12. 완료 메시지
echo ""
echo "================================"
echo -e "${GREEN}🎉 Vercel 설정이 완료되었습니다!${NC}"
echo "================================"
echo ""
echo "다음 단계:"
echo "1. GitHub에 코드 push"
echo "2. GitHub Actions가 자동으로 배포 시작"
echo "3. PR 생성 시 프리뷰 URL 자동 생성"
echo ""
echo "배포 상태 확인:"
echo "  - GitHub: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/actions"
echo "  - Vercel: https://vercel.com/$VERCEL_ORG_ID/choi-pd-ecosystem"
echo ""
echo -e "${GREEN}Happy Deploying! 🚀${NC}"