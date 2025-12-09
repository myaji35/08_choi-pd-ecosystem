#!/bin/bash

# GCP 서버 초기 설정 스크립트
# 서버에서 실행: bash server-setup.sh

echo "🚀 GCP 서버 설정 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 시스템 업데이트
echo -e "${YELLOW}1. 시스템 업데이트 중...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Node.js 18.x 설치
echo -e "${YELLOW}2. Node.js 18.x 설치 중...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node.js 버전 확인
node --version
npm --version

# 3. PM2 설치
echo -e "${YELLOW}3. PM2 설치 중...${NC}"
sudo npm install -g pm2

# 4. Git 설치 (필요시)
echo -e "${YELLOW}4. Git 설치 중...${NC}"
sudo apt-get install -y git

# 5. SQLite3 설치
echo -e "${YELLOW}5. SQLite3 설치 중...${NC}"
sudo apt-get install -y sqlite3

# 6. 프로젝트 디렉토리 생성
echo -e "${YELLOW}6. 프로젝트 디렉토리 생성 중...${NC}"
mkdir -p ~/choi-pd-ecosystem
mkdir -p ~/choi-pd-ecosystem/data
mkdir -p ~/choi-pd-ecosystem/logs
mkdir -p ~/choi-pd-ecosystem/public/uploads

# 7. 방화벽 설정 (ufw)
echo -e "${YELLOW}7. 방화벽 설정 중...${NC}"
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 8000/tcp  # 애플리케이션
sudo ufw --force enable

# 8. Swap 메모리 설정 (메모리가 부족한 경우)
echo -e "${YELLOW}8. Swap 메모리 설정 중...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo -e "${GREEN}✅ 서버 설정 완료!${NC}"
echo ""
echo "다음 단계:"
echo "1. 로컬에서 파일을 압축하여 전송"
echo "2. 압축 해제 후 npm install"
echo "3. pm2 start ecosystem.config.js"