#!/bin/bash
# =============================================================================
# Coolify 배포 안정성 검증 스크립트
# imPD Platform - Health Check & Monitoring
# =============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
APP_URL="${APP_URL:-http://localhost:3011}"
HEALTH_ENDPOINT="${APP_URL}/api/health"
MAX_RETRIES=5
RETRY_DELAY=5

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   imPD Platform - Coolify 안정성 검증${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 함수: 성공 메시지
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 함수: 오류 메시지
error() {
    echo -e "${RED}❌ $1${NC}"
}

# 함수: 정보 메시지
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# 1. Docker 환경 검증
# =============================================================================
echo -e "\n${BLUE}[1/6] Docker 환경 검증${NC}"
echo "----------------------------------------"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    success "Docker 설치됨: ${DOCKER_VERSION}"
else
    error "Docker가 설치되어 있지 않습니다"
    exit 1
fi

if docker info &> /dev/null; then
    success "Docker 데몬 실행 중"
else
    error "Docker 데몬이 실행되지 않습니다"
    exit 1
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    success "Docker Compose 사용 가능"
else
    warning "Docker Compose가 설치되어 있지 않습니다"
fi

# =============================================================================
# 2. 설정 파일 검증
# =============================================================================
echo -e "\n${BLUE}[2/6] 설정 파일 검증${NC}"
echo "----------------------------------------"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Dockerfile 검증
if [ -f "${PROJECT_ROOT}/choi-pd-ecosystem/Dockerfile" ]; then
    success "Dockerfile 존재"

    # 필수 설정 확인
    if grep -q "HEALTHCHECK" "${PROJECT_ROOT}/choi-pd-ecosystem/Dockerfile"; then
        success "Dockerfile: HEALTHCHECK 설정됨"
    else
        warning "Dockerfile: HEALTHCHECK 미설정"
    fi

    if grep -q "dumb-init" "${PROJECT_ROOT}/choi-pd-ecosystem/Dockerfile"; then
        success "Dockerfile: dumb-init (graceful shutdown) 설정됨"
    else
        warning "Dockerfile: dumb-init 미설정 - 시그널 처리 문제 가능"
    fi
else
    error "Dockerfile이 없습니다"
fi

# docker-compose.yml 검증
if [ -f "${PROJECT_ROOT}/docker-compose.yml" ]; then
    success "docker-compose.yml 존재"

    if grep -q "healthcheck" "${PROJECT_ROOT}/docker-compose.yml"; then
        success "docker-compose: healthcheck 설정됨"
    else
        warning "docker-compose: healthcheck 미설정"
    fi

    if grep -q "restart:" "${PROJECT_ROOT}/docker-compose.yml"; then
        success "docker-compose: restart 정책 설정됨"
    else
        warning "docker-compose: restart 정책 미설정"
    fi
else
    error "docker-compose.yml이 없습니다"
fi

# .coolify.yml 검증
if [ -f "${PROJECT_ROOT}/.coolify.yml" ]; then
    success ".coolify.yml 존재"
else
    warning ".coolify.yml이 없습니다 (Coolify UI에서 설정 필요)"
fi

# =============================================================================
# 3. 환경 변수 검증
# =============================================================================
echo -e "\n${BLUE}[3/6] 환경 변수 검증${NC}"
echo "----------------------------------------"

ENV_FILE="${PROJECT_ROOT}/choi-pd-ecosystem/.env.local"
ENV_EXAMPLE="${PROJECT_ROOT}/choi-pd-ecosystem/.env.example"

if [ -f "$ENV_FILE" ]; then
    success ".env.local 파일 존재"

    # 필수 환경 변수 확인
    REQUIRED_VARS=("DATABASE_URL" "NODE_ENV")
    OPTIONAL_VARS=("JWT_SECRET" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "CLERK_SECRET_KEY")

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" "$ENV_FILE"; then
            success "필수 환경변수 ${var} 설정됨"
        else
            error "필수 환경변수 ${var} 미설정"
        fi
    done

    for var in "${OPTIONAL_VARS[@]}"; do
        if grep -q "^${var}=" "$ENV_FILE"; then
            success "선택 환경변수 ${var} 설정됨"
        else
            info "선택 환경변수 ${var} 미설정 (필요시 설정)"
        fi
    done
else
    warning ".env.local 파일이 없습니다"
    if [ -f "$ENV_EXAMPLE" ]; then
        info ".env.example 파일을 복사하여 설정하세요:"
        echo "   cp ${ENV_EXAMPLE} ${ENV_FILE}"
    fi
fi

# =============================================================================
# 4. 네트워크 포트 검증
# =============================================================================
echo -e "\n${BLUE}[4/6] 네트워크 포트 검증${NC}"
echo "----------------------------------------"

PORT=3011
if command -v lsof &> /dev/null; then
    if lsof -i :${PORT} &> /dev/null; then
        warning "포트 ${PORT}이 이미 사용 중입니다"
        lsof -i :${PORT} | head -5
    else
        success "포트 ${PORT} 사용 가능"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":${PORT}"; then
        warning "포트 ${PORT}이 이미 사용 중입니다"
    else
        success "포트 ${PORT} 사용 가능"
    fi
else
    info "포트 검사 도구(lsof/netstat)가 없습니다"
fi

# =============================================================================
# 5. 빌드 테스트
# =============================================================================
echo -e "\n${BLUE}[5/6] 빌드 테스트${NC}"
echo "----------------------------------------"

cd "${PROJECT_ROOT}/choi-pd-ecosystem"

if [ -f "package.json" ]; then
    success "package.json 존재"

    # node_modules 확인
    if [ -d "node_modules" ]; then
        success "node_modules 존재"
    else
        warning "node_modules가 없습니다. npm install 필요"
    fi

    # Next.js 설정 확인
    if [ -f "next.config.js" ]; then
        success "next.config.js 존재"

        if grep -q "output.*standalone" "next.config.js"; then
            success "Next.js standalone 출력 설정됨"
        else
            info "Next.js standalone 출력은 DOCKER_BUILD=true 시 활성화"
        fi
    fi
else
    error "package.json이 없습니다"
fi

# =============================================================================
# 6. Health Check 테스트 (실행 중인 경우)
# =============================================================================
echo -e "\n${BLUE}[6/6] Health Check 테스트${NC}"
echo "----------------------------------------"

health_check() {
    local url=$1
    local response
    local http_code

    response=$(curl -s -w "\n%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        return 0
    else
        return 1
    fi
}

info "Health endpoint 테스트: ${HEALTH_ENDPOINT}"

if health_check "$HEALTH_ENDPOINT"; then
    success "애플리케이션이 정상 실행 중입니다"

    # 상세 헬스 정보 출력
    HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT" 2>/dev/null)
    if [ -n "$HEALTH_RESPONSE" ]; then
        echo ""
        echo "Health Check 응답:"
        echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
    fi
else
    info "애플리케이션이 실행되지 않았거나 접근할 수 없습니다"
    info "애플리케이션 실행 후 다시 테스트하세요"
fi

# =============================================================================
# 결과 요약
# =============================================================================
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   검증 완료${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "다음 단계:"
echo "1. 문제가 있는 항목을 수정하세요"
echo "2. Docker 빌드 테스트: docker build -t impd-test ./choi-pd-ecosystem"
echo "3. 로컬 실행 테스트: docker-compose up -d"
echo "4. Coolify에서 배포"
echo ""
echo "Coolify 배포 시 확인사항:"
echo "- Build Pack: Dockerfile"
echo "- Base Directory: /choi-pd-ecosystem"
echo "- Port: 3011"
echo "- Health Check Path: /api/health"
echo ""
