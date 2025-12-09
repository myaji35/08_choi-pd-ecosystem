#!/bin/bash
# =============================================================================
# imPD Platform - 데이터 백업 스크립트
# Coolify/Docker 환경용 자동 백업
# =============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 설정
BACKUP_DIR="${BACKUP_DIR:-/home/socialdoctors35/backups/impd}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
CONTAINER_NAME="${CONTAINER_NAME:-impd-nextjs}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# 함수 정의
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# 백업 디렉토리 생성
# =============================================================================
create_backup_dir() {
    log_info "백업 디렉토리 확인 중..."
    mkdir -p "${BACKUP_DIR}/daily"
    mkdir -p "${BACKUP_DIR}/weekly"
    mkdir -p "${BACKUP_DIR}/logs"
    log_success "백업 디렉토리 준비 완료: ${BACKUP_DIR}"
}

# =============================================================================
# SQLite 데이터베이스 백업
# =============================================================================
backup_database() {
    log_info "SQLite 데이터베이스 백업 시작..."

    local DB_BACKUP_FILE="${BACKUP_DIR}/daily/database_${TIMESTAMP}.db"

    # Docker 컨테이너에서 백업 (Coolify 환경)
    if docker ps --format '{{.Names}}' | grep -q "${CONTAINER_NAME}"; then
        log_info "Docker 컨테이너에서 데이터베이스 복사 중..."
        docker cp "${CONTAINER_NAME}:/app/data/database.db" "${DB_BACKUP_FILE}" 2>/dev/null || {
            log_warning "컨테이너에서 DB 복사 실패, 볼륨 직접 접근 시도..."

            # Docker 볼륨에서 직접 복사
            local VOLUME_PATH=$(docker volume inspect impd-data --format '{{.Mountpoint}}' 2>/dev/null)
            if [ -n "$VOLUME_PATH" ] && [ -f "${VOLUME_PATH}/database.db" ]; then
                sudo cp "${VOLUME_PATH}/database.db" "${DB_BACKUP_FILE}"
            else
                log_warning "볼륨에서도 DB를 찾을 수 없습니다"
                return 1
            fi
        }
    else
        # 로컬 개발 환경
        local LOCAL_DB="./choi-pd-ecosystem/data/database.db"
        if [ -f "$LOCAL_DB" ]; then
            cp "$LOCAL_DB" "${DB_BACKUP_FILE}"
        else
            log_warning "데이터베이스 파일을 찾을 수 없습니다"
            return 1
        fi
    fi

    # 백업 파일 압축
    if [ -f "${DB_BACKUP_FILE}" ]; then
        gzip "${DB_BACKUP_FILE}"
        log_success "데이터베이스 백업 완료: ${DB_BACKUP_FILE}.gz"
    fi
}

# =============================================================================
# 업로드 파일 백업
# =============================================================================
backup_uploads() {
    log_info "업로드 파일 백업 시작..."

    local UPLOADS_BACKUP_FILE="${BACKUP_DIR}/daily/uploads_${TIMESTAMP}.tar.gz"

    # Docker 컨테이너에서 백업
    if docker ps --format '{{.Names}}' | grep -q "${CONTAINER_NAME}"; then
        # 임시 디렉토리 생성
        local TEMP_DIR=$(mktemp -d)
        docker cp "${CONTAINER_NAME}:/app/public/uploads" "${TEMP_DIR}/" 2>/dev/null || {
            log_warning "업로드 폴더가 비어있거나 없습니다"
            rm -rf "$TEMP_DIR"
            return 0
        }

        if [ -d "${TEMP_DIR}/uploads" ] && [ "$(ls -A ${TEMP_DIR}/uploads 2>/dev/null)" ]; then
            tar -czf "${UPLOADS_BACKUP_FILE}" -C "${TEMP_DIR}" uploads
            log_success "업로드 파일 백업 완료: ${UPLOADS_BACKUP_FILE}"
        else
            log_info "업로드된 파일이 없습니다"
        fi
        rm -rf "$TEMP_DIR"
    else
        # 로컬 환경
        local LOCAL_UPLOADS="./choi-pd-ecosystem/public/uploads"
        if [ -d "$LOCAL_UPLOADS" ] && [ "$(ls -A $LOCAL_UPLOADS 2>/dev/null)" ]; then
            tar -czf "${UPLOADS_BACKUP_FILE}" -C "./choi-pd-ecosystem/public" uploads
            log_success "업로드 파일 백업 완료: ${UPLOADS_BACKUP_FILE}"
        else
            log_info "업로드된 파일이 없습니다"
        fi
    fi
}

# =============================================================================
# 환경 설정 백업
# =============================================================================
backup_config() {
    log_info "환경 설정 백업 시작..."

    local CONFIG_BACKUP_FILE="${BACKUP_DIR}/daily/config_${TIMESTAMP}.tar.gz"
    local TEMP_DIR=$(mktemp -d)

    # 중요 설정 파일 복사
    mkdir -p "${TEMP_DIR}/config"

    # 로컬 설정 파일들
    local CONFIG_FILES=(
        "./docker-compose.yml"
        "./.coolify.yml"
        "./choi-pd-ecosystem/next.config.js"
        "./choi-pd-ecosystem/drizzle.config.ts"
        "./choi-pd-ecosystem/package.json"
    )

    for file in "${CONFIG_FILES[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "${TEMP_DIR}/config/"
        fi
    done

    # .env 파일은 백업하지만 별도 보관 (보안)
    if [ -f "./choi-pd-ecosystem/.env.local" ]; then
        cp "./choi-pd-ecosystem/.env.local" "${TEMP_DIR}/config/.env.local.backup"
        log_warning ".env.local 파일이 백업에 포함됩니다 (보안 주의)"
    fi

    tar -czf "${CONFIG_BACKUP_FILE}" -C "${TEMP_DIR}" config
    rm -rf "$TEMP_DIR"

    log_success "환경 설정 백업 완료: ${CONFIG_BACKUP_FILE}"
}

# =============================================================================
# 주간 백업 생성
# =============================================================================
create_weekly_backup() {
    local DAY_OF_WEEK=$(date +%u)

    # 일요일(7)에만 주간 백업 생성
    if [ "$DAY_OF_WEEK" -eq 7 ]; then
        log_info "주간 백업 생성 중..."

        local WEEKLY_BACKUP="${BACKUP_DIR}/weekly/full_backup_week_$(date +%Y%W).tar.gz"

        if [ -d "${BACKUP_DIR}/daily" ]; then
            tar -czf "${WEEKLY_BACKUP}" -C "${BACKUP_DIR}" daily
            log_success "주간 백업 완료: ${WEEKLY_BACKUP}"
        fi
    fi
}

# =============================================================================
# 오래된 백업 정리
# =============================================================================
cleanup_old_backups() {
    log_info "오래된 백업 정리 중 (${RETENTION_DAYS}일 이상)..."

    # 일일 백업 정리
    find "${BACKUP_DIR}/daily" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

    # 주간 백업은 4주 보관
    find "${BACKUP_DIR}/weekly" -type f -mtime +28 -delete 2>/dev/null || true

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
    echo "일일 백업:"
    ls -lh "${BACKUP_DIR}/daily" 2>/dev/null | tail -5 || echo "  (없음)"

    echo ""
    echo "주간 백업:"
    ls -lh "${BACKUP_DIR}/weekly" 2>/dev/null | tail -3 || echo "  (없음)"

    echo ""
    echo "디스크 사용량:"
    du -sh "${BACKUP_DIR}" 2>/dev/null || echo "  (확인 불가)"
    echo ""
}

# =============================================================================
# GCS 업로드 (선택사항)
# =============================================================================
upload_to_gcs() {
    if command -v gsutil &> /dev/null && [ -n "$GCS_BUCKET" ]; then
        log_info "Google Cloud Storage 업로드 중..."
        gsutil -m cp -r "${BACKUP_DIR}/daily/*_${DATE_ONLY}*" "gs://${GCS_BUCKET}/impd/daily/" 2>/dev/null || {
            log_warning "GCS 업로드 실패"
            return 1
        }
        log_success "GCS 업로드 완료"
    else
        log_info "GCS 업로드 건너뜀 (gsutil 없음 또는 GCS_BUCKET 미설정)"
    fi
}

# =============================================================================
# 메인 실행
# =============================================================================
main() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}   imPD Platform - 백업 시작${NC}"
    echo -e "${BLUE}   $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""

    create_backup_dir
    backup_database
    backup_uploads
    backup_config
    create_weekly_backup
    cleanup_old_backups
    upload_to_gcs
    check_backup_status

    echo -e "${GREEN}백업이 완료되었습니다!${NC}"
    echo ""

    # 백업 로그 저장
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 백업 완료" >> "${BACKUP_DIR}/logs/backup.log"
}

# 스크립트 실행
main "$@"
