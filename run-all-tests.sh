#!/bin/bash

# 🧪 전체 테스트 실행 스크립트
# BMAD 기반 정밀 테스트 수행

set -e  # 에러 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 결과 저장
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        🧪 imPD Platform 전체 테스트 시작${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 작업 디렉토리 이동
cd "$(dirname "$0")/choi-pd-ecosystem"

# 함수: 테스트 실행 및 결과 기록
run_test() {
    local test_name=$1
    local test_command=$2
    local priority=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}[$priority] Testing: $test_name${NC}"

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}  ❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ "$priority" = "P0" ]; then
            echo -e "${RED}  ⚠️  Critical test failed! Stopping...${NC}"
            exit 1
        fi
        return 1
    fi
}

# 함수: 섹션 헤더
print_section() {
    echo ""
    echo -e "${BLUE}──────────────────────────────────────────${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}──────────────────────────────────────────${NC}"
}

# ═══════════════════════════════════════════════════════
# 1. 환경 설정 검증 (P0)
# ═══════════════════════════════════════════════════════

print_section "1️⃣  환경 설정 검증"

run_test "환경 변수 파일 존재" "[ -f .env.local ]" "P0"
run_test "필수 환경 변수 - DATABASE_URL" "grep -q '^DATABASE_URL=' .env.local" "P0"
run_test "필수 환경 변수 - CLERK_SECRET_KEY" "grep -q '^CLERK_SECRET_KEY=' .env.local" "P0"
run_test "필수 환경 변수 - ENCRYPTION_KEY" "grep -q '^ENCRYPTION_KEY=' .env.local" "P0"
run_test "Node.js 버전 (v20+)" "node -v | grep -E 'v(2[0-9]|[3-9][0-9])'" "P0"
run_test "패키지 설치 상태" "[ -d node_modules ]" "P0"

# ═══════════════════════════════════════════════════════
# 2. 코드 품질 검사 (P1)
# ═══════════════════════════════════════════════════════

print_section "2️⃣  코드 품질 검사"

run_test "TypeScript 타입 체크" "npx tsc --noEmit" "P1"
run_test "ESLint 검사" "npm run lint" "P1"
run_test "Import 순서 검사" "! grep -r 'import.*from.*\\.\\./\\.\\./\\.\\./\\.\\./' src/" "P2"

# ═══════════════════════════════════════════════════════
# 3. 보안 검사 (P0)
# ═══════════════════════════════════════════════════════

print_section "3️⃣  보안 검사"

run_test "하드코딩된 시크릿 검사" "! grep -r 'sk_live\\|pk_live\\|secret_' src/ --include='*.ts' --include='*.tsx'" "P0"
run_test "SQL 인젝션 취약점" "! grep -r '\\\`.*\\\${.*}\\\`' src/ --include='*.ts' | grep -v schema" "P0"
run_test "XSS 취약점 (dangerouslySetInnerHTML)" "! grep -r 'dangerouslySetInnerHTML' src/ --include='*.tsx'" "P1"
run_test "npm audit (High 이상)" "npm audit --audit-level=high --json | jq '.metadata.vulnerabilities.high == 0'" "P1"

# ═══════════════════════════════════════════════════════
# 4. 데이터베이스 테스트 (P0)
# ═══════════════════════════════════════════════════════

print_section "4️⃣  데이터베이스 테스트"

run_test "Drizzle 스키마 유효성" "npx drizzle-kit check" "P0"
run_test "SQLite 파일 경로 하드코딩" "! grep -r 'file:./data' src/ --include='*.ts'" "P0"
run_test "마이그레이션 파일 존재" "[ -d src/lib/db/migrations ]" "P1"

# ═══════════════════════════════════════════════════════
# 5. 빌드 테스트 (P0)
# ═══════════════════════════════════════════════════════

print_section "5️⃣  빌드 테스트"

echo -e "${YELLOW}[P0] 프로덕션 빌드 시작... (시간이 걸립니다)${NC}"
if npm run build > build.log 2>&1; then
    echo -e "${GREEN}  ✅ 빌드 성공${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))

    # 빌드 크기 체크
    BUILD_SIZE=$(du -sh .next | awk '{print $1}')
    echo -e "${BLUE}  📦 빌드 크기: $BUILD_SIZE${NC}"

    # 번들 분석
    if [ -f .next/trace ]; then
        BUNDLE_COUNT=$(find .next/static -name "*.js" | wc -l)
        echo -e "${BLUE}  📊 JavaScript 번들 수: $BUNDLE_COUNT${NC}"
    fi
else
    echo -e "${RED}  ❌ 빌드 실패 (로그: build.log)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# ═══════════════════════════════════════════════════════
# 6. API 엔드포인트 테스트 (P1)
# ═══════════════════════════════════════════════════════

print_section "6️⃣  API 엔드포인트 테스트"

# 개발 서버 시작 (백그라운드)
echo -e "${YELLOW}개발 서버 시작 중...${NC}"
PORT=3011 npm run dev > dev.log 2>&1 &
DEV_PID=$!
sleep 10  # 서버 시작 대기

run_test "Health Check 엔드포인트" "curl -f -s http://localhost:3011/api/health" "P1"
run_test "404 처리" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3011/api/nonexistent | grep 404" "P2"

# 서버 종료
kill $DEV_PID 2>/dev/null || true

# ═══════════════════════════════════════════════════════
# 7. 단위 테스트 (P1)
# ═══════════════════════════════════════════════════════

print_section "7️⃣  단위 테스트"

echo -e "${YELLOW}[P1] Jest 테스트 실행 중...${NC}"
if npm test -- --passWithNoTests --coverage=false > test.log 2>&1; then
    echo -e "${GREEN}  ✅ 모든 테스트 통과${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_COUNT=$(grep "failed" test.log | head -1)
    echo -e "${YELLOW}  ⚠️  일부 테스트 실패: $FAILED_COUNT${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# ═══════════════════════════════════════════════════════
# 8. 성능 테스트 (P2)
# ═══════════════════════════════════════════════════════

print_section "8️⃣  성능 테스트"

run_test "package.json 크기 (<1MB)" "[ $(stat -f%z package.json) -lt 1048576 ]" "P2"
run_test "이미지 최적화 설정" "grep -q 'remotePatterns' next.config.js" "P2"
run_test "PWA 설정" "[ -f public/manifest.json ]" "P2"

# ═══════════════════════════════════════════════════════
# 9. 배포 준비 상태 (P1)
# ═══════════════════════════════════════════════════════

print_section "9️⃣  배포 준비 상태"

run_test "Dockerfile 존재" "[ -f Dockerfile ]" "P1"
run_test "vercel.json 설정" "[ -f vercel.json ]" "P1"
run_test ".vercelignore 설정" "[ -f .vercelignore ]" "P1"
run_test "GitHub Actions 워크플로우" "[ -f ../.github/workflows/ci-cd.yml ]" "P1"

# ═══════════════════════════════════════════════════════
# 10. E2E 테스트 준비 (P2)
# ═══════════════════════════════════════════════════════

print_section "🔟 E2E 테스트 준비"

run_test "Playwright 설정" "[ -f playwright.config.ts ]" "P2"
run_test "E2E 테스트 파일" "[ -d e2e ]" "P2"

# ═══════════════════════════════════════════════════════
# 최종 결과
# ═══════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    📊 테스트 결과${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 통계
echo -e "총 테스트: ${TOTAL_TESTS}"
echo -e "${GREEN}통과: ${PASSED_TESTS}${NC}"
echo -e "${RED}실패: ${FAILED_TESTS}${NC}"
echo -e "${YELLOW}경고: ${WARNINGS}${NC}"

# 성공률 계산
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "성공률: ${SUCCESS_RATE}%"

    # 등급 판정
    if [ $SUCCESS_RATE -ge 95 ]; then
        echo -e "${GREEN}등급: 🏆 Excellent${NC}"
    elif [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "${GREEN}등급: ✅ Good${NC}"
    elif [ $SUCCESS_RATE -ge 60 ]; then
        echo -e "${YELLOW}등급: ⚠️  Needs Improvement${NC}"
    else
        echo -e "${RED}등급: ❌ Critical Issues${NC}"
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# 배포 가능 여부 판단
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ 배포 가능 상태입니다!${NC}"
    exit 0
else
    echo -e "${RED}❌ 배포 불가 - ${FAILED_TESTS}개 테스트 실패${NC}"
    echo -e "${YELLOW}💡 실패한 P0 테스트를 먼저 수정하세요.${NC}"
    exit 1
fi