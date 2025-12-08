#!/bin/bash

# GitHub Secrets 설정 스크립트
# Vercel Token을 받아서 모든 Secrets를 자동 설정합니다

echo "🔧 GitHub Secrets 설정 시작"
echo "=========================="

# 확인된 값들
VERCEL_ORG_ID="myaji35-4938"
VERCEL_PROJECT_ID="prj_ERxaoDXSS84hs3BRj2ZrSeT5tyYi"
GITHUB_REPO="myaji35/08_choi-pd-ecosystem"

# Vercel Token 입력 받기
echo ""
echo "📝 Vercel Token이 필요합니다."
echo "   1. https://vercel.com/account/tokens 에서 생성"
echo "   2. 이름: github-actions"
echo "   3. Scope: Full Access"
echo ""
read -s -p "Vercel Token을 붙여넣으세요 (입력 내용은 보이지 않습니다): " VERCEL_TOKEN
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Token이 입력되지 않았습니다."
    exit 1
fi

echo ""
echo "🚀 GitHub Secrets 설정 중..."

# VERCEL_TOKEN 설정
echo -n "  Setting VERCEL_TOKEN... "
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$GITHUB_REPO" 2>/dev/null && echo "✅" || echo "❌"

# VERCEL_ORG_ID 설정
echo -n "  Setting VERCEL_ORG_ID... "
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$GITHUB_REPO" 2>/dev/null && echo "✅" || echo "❌"

# VERCEL_PROJECT_ID 설정
echo -n "  Setting VERCEL_PROJECT_ID... "
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$GITHUB_REPO" 2>/dev/null && echo "✅" || echo "❌"

echo ""
echo "📋 설정 확인:"
echo "============"
gh secret list --repo="$GITHUB_REPO" | grep VERCEL || echo "Secrets를 확인할 수 없습니다."

echo ""
echo "✅ GitHub Secrets 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. Vercel 대시보드에서 환경 변수 설정"
echo "   👉 https://vercel.com/$VERCEL_ORG_ID/$VERCEL_PROJECT_ID/settings/environment-variables"
echo ""
echo "2. 테스트 배포:"
echo "   git push origin main"
echo ""
echo "3. 배포 상태 확인:"
echo "   👉 https://github.com/$GITHUB_REPO/actions"