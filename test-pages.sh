#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 페이지 테스트 시작..."
echo "================================"

# URL 목록 생성
urls=(
  "/"
  "/chopd"
  "/chopd/education"
  "/chopd/media"
  "/chopd/media/greeting"
  "/chopd/works"
  "/chopd/community"
  "/admin"
  "/admin/login"
  "/admin/dashboard"
  "/admin/distributors"
  "/admin/distributors/new"
  "/admin/distributors/pending"
  "/admin/resources"
  "/admin/resources/new"
  "/admin/activity-log"
  "/admin/analytics"
  "/admin/hero-images"
  "/admin/kanban"
  "/admin/newsletter"
  "/admin/notifications"
  "/admin/payments"
  "/admin/invoices"
  "/admin/profile"
  "/admin/social"
  "/admin/subscription-plans"
  "/pd"
  "/pd/login"
  "/pd/dashboard"
  "/pd/dashboard/profile"
  "/pd/dashboard/hero-images"
  "/pd/dashboard/kanban"
  "/pd/dashboard/newsletter"
  "/pd/dashboard/social"
  "/pd/inquiries"
  "/pd/newsletter"
  "/pd/notifications"
  "/pd/scheduled-posts"
  "/pd/sns-accounts"
)

# 각 URL 테스트
for url in "${urls[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3011$url")

  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ $url - OK ($response)${NC}"
  elif [ "$response" = "404" ]; then
    echo -e "${RED}❌ $url - 404 NOT FOUND${NC}"
  elif [ "$response" = "500" ]; then
    echo -e "${RED}⚠️  $url - 500 ERROR${NC}"
  elif [ "$response" = "302" ] || [ "$response" = "307" ]; then
    echo -e "${YELLOW}↪️  $url - REDIRECT ($response)${NC}"
  else
    echo -e "${YELLOW}⚠️  $url - Status: $response${NC}"
  fi
done

echo "================================"
echo "테스트 완료!"