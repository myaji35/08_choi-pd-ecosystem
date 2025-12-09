#!/bin/bash
# =============================================================================
# Coolify 서버 전체 백업 스크립트
# Coolify DB + 배포된 앱 데이터 백업
# =============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 설정
BACKUP_DIR="${BACKUP_DIR:-/home/socialdoctors35/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# 백업 디렉토리 생성
# =============================================================================
create_backup_dir() {
    log_info "백업 디렉토리 확인 중..."
    mkdir -p "${BACKUP_DIR}/coolify"
    mkdir -p "${BACKUP_DIR}/apps"
    mkdir -p "${BACKUP_DIR}/logs"
    log_success "백업 디렉토리 준비 완료: ${BACKUP_DIR}"
}

# =============================================================================
# Coolify PostgreSQL 백업
# =============================================================================
backup_coolify_db() {
    log_info "Coolify PostgreSQL 백업 시작..."

    local DB_BACKUP_FILE="${BACKUP_DIR}/coolify/coolify_db_${TIMESTAMP}.sql"

    if docker ps --format '{{.Names}}' | grep -q "coolify-db"; then
        docker exec coolify-db pg_dump -U coolify coolify > "${DB_BACKUP_FILE}" 2>/dev/null

        if [ -f "${DB_BACKUP_FILE}" ] && [ -s "${DB_BACKUP_FILE}" ]; then
            gzip "${DB_BACKUP_FILE}"
            log_success "Coolify DB 백업 완료: ${DB_BACKUP_FILE}.gz"
        else
            log_warning "Coolify DB 백업 실패 또는 빈 파일"
            rm -f "${DB_BACKUP_FILE}"
        fi
    else
        log_warning "coolify-db 컨테이너가 실행되지 않음"
    fi
}

# =============================================================================
# Coolify Redis 백업
# =============================================================================
backup_coolify_redis() {
    log_info "Coolify Redis 백업 시작..."

    local REDIS_BACKUP_FILE="${BACKUP_DIR}/coolify/coolify_redis_${TIMESTAMP}.rdb"

    if docker ps --format '{{.Names}}' | grep -q "coolify-redis"; then
        # Redis BGSAVE 실행
        docker exec coolify-redis redis-cli BGSAVE 2>/dev/null || true
        sleep 2

        # RDB 파일 복사
        docker cp coolify-redis:/data/dump.rdb "${REDIS_BACKUP_FILE}" 2>/dev/null || {
            log_warning "Redis RDB 파일 복사 실패"
            return 0
        }

        if [ -f "${REDIS_BACKUP_FILE}" ]; then
            gzip "${REDIS_BACKUP_FILE}"
            log_success "Coolify Redis 백업 완료: ${REDIS_BACKUP_FILE}.gz"
        fi
    else
        log_warning "coolify-redis 컨테이너가 실행되지 않음"
    fi
}

# =============================================================================
# Docker 볼륨 목록 백업
# =============================================================================
backup_volume_list() {
    log_info "Docker 볼륨 목록 저장..."

    local VOLUME_LIST="${BACKUP_DIR}/coolify/volume_list_${TIMESTAMP}.txt"

    docker volume ls > "${VOLUME_LIST}"
    log_success "볼륨 목록 저장 완료: ${VOLUME_LIST}"
}

# =============================================================================
# 실행 중인 앱 컨테이너 정보 백업
# =============================================================================
backup_container_info() {
    log_info "컨테이너 정보 백업..."

    local CONTAINER_INFO="${BACKUP_DIR}/coolify/container_info_${TIMESTAMP}.json"

    docker ps --format '{"name":"{{.Names}}", "image":"{{.Image}}", "status":"{{.Status}}", "ports":"{{.Ports}}"}' > "${CONTAINER_INFO}"
    log_success "컨테이너 정보 저장 완료: ${CONTAINER_INFO}"
}

# =============================================================================
# 오래된 백업 정리
# =============================================================================
cleanup_old_backups() {
    log_info "오래된 백업 정리 중 (${RETENTION_DAYS}일 이상)..."

    find "${BACKUP_DIR}/coolify" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "${BACKUP_DIR}/apps" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

    log_success "오래된 백업 정리 완료"
}

# =============================================================================
# 백업 상태 확인
# =============================================================================
check_backup_status() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}   백업 상태 요약${NC}"
    echo -e "${BLUE}================================================${NC}"

    echo ""
    echo "Coolify 백업:"
    ls -lh "${BACKUP_DIR}/coolify" 2>/dev/null | tail -10 || echo "  (없음)"

    echo ""
    echo "디스크 사용량:"
    du -sh "${BACKUP_DIR}" 2>/dev/null || echo "  (확인 불가)"

    echo ""
    echo "서버 디스크 상태:"
    df -h / | tail -1
    echo ""
}

# =============================================================================
# 메인 실행
# =============================================================================
main() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}   Coolify 서버 백업 시작${NC}"
    echo -e "${BLUE}   $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""

    create_backup_dir
    backup_coolify_db
    backup_coolify_redis
    backup_volume_list
    backup_container_info
    cleanup_old_backups
    check_backup_status

    echo -e "${GREEN}백업이 완료되었습니다!${NC}"
    echo ""

    # 백업 로그 저장
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Coolify 백업 완료" >> "${BACKUP_DIR}/logs/backup.log"
}

# 스크립트 실행
main "$@"
