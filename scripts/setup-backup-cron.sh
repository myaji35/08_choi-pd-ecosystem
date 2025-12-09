#!/bin/bash
# =============================================================================
# Coolify 서버에 백업 cron 설정
# 매일 새벽 3시에 백업 실행
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"

echo "백업 cron 작업 설정 중..."

# 백업 디렉토리 생성
mkdir -p /home/socialdoctors35/backups/impd

# cron 작업 추가 (매일 새벽 3시 KST = UTC 18:00 전날)
CRON_JOB="0 18 * * * cd ${SCRIPT_DIR}/.. && ${BACKUP_SCRIPT} >> /home/socialdoctors35/backups/impd/logs/cron.log 2>&1"

# 기존 cron 작업 확인 및 추가
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_JOB") | crontab -

echo "Cron 작업이 설정되었습니다:"
echo "  - 매일 새벽 3시 KST 백업 실행"
echo ""
echo "현재 cron 작업 목록:"
crontab -l

echo ""
echo "수동 백업 실행: ${BACKUP_SCRIPT}"
