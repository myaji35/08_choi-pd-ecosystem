#!/bin/bash

# GCP 배포 스크립트
# Usage: ./deploy-gcp.sh

echo "🚀 GCP 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# GCP 서버 정보
GCP_HOST="34.64.191.91"
GCP_USER="your-username"  # GCP 사용자명으로 변경하세요
GCP_PORT="8000"
DEPLOY_PATH="/home/${GCP_USER}/choi-pd-ecosystem"

# 1. 프로덕션 빌드 생성
echo -e "${YELLOW}1. 프로덕션 빌드 생성 중...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 빌드 성공${NC}"

# 2. 필요한 파일 압축
echo -e "${YELLOW}2. 배포 파일 압축 중...${NC}"
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.js \
    src/lib \
    src/styles \
    .env.production \
    data

echo -e "${GREEN}✅ 압축 완료${NC}"

# 3. GCP 서버로 파일 전송
echo -e "${YELLOW}3. GCP 서버로 파일 전송 중...${NC}"
echo "비밀번호를 입력하세요:"
scp deploy.tar.gz ${GCP_USER}@${GCP_HOST}:~/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 파일 전송 실패${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 파일 전송 완료${NC}"

# 4. 서버에서 배포 실행
echo -e "${YELLOW}4. 서버에서 배포 실행 중...${NC}"
ssh ${GCP_USER}@${GCP_HOST} << 'ENDSSH'
    # 배포 디렉토리 생성
    mkdir -p ~/choi-pd-ecosystem
    cd ~/choi-pd-ecosystem

    # 기존 파일 백업
    if [ -d ".next" ]; then
        mv .next .next.backup
    fi

    # 압축 해제
    tar -xzf ~/deploy.tar.gz

    # 종속성 설치
    npm ci --production

    # PM2로 서비스 재시작 (또는 처음 시작)
    if pm2 list | grep -q "choi-pd-ecosystem"; then
        pm2 restart choi-pd-ecosystem
    else
        PORT=8000 pm2 start npm --name "choi-pd-ecosystem" -- start
        pm2 save
        pm2 startup
    fi

    # 정리
    rm ~/deploy.tar.gz

    echo "✅ 배포 완료!"
    echo "서버 상태:"
    pm2 status choi-pd-ecosystem
ENDSSH

# 5. 로컬 정리
echo -e "${YELLOW}5. 로컬 파일 정리 중...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}🎉 배포 완료!${NC}"
echo -e "URL: http://${GCP_HOST}:${GCP_PORT}"
echo ""
echo "서버 로그 확인:"
echo "  ssh ${GCP_USER}@${GCP_HOST} 'pm2 logs choi-pd-ecosystem'"
echo ""
echo "서버 재시작:"
echo "  ssh ${GCP_USER}@${GCP_HOST} 'pm2 restart choi-pd-ecosystem'"