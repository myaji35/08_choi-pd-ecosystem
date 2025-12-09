# 🚀 GCP 서버 배포 가이드

**서버 주소**: 34.64.191.91:8000
**준비 완료**: ✅ 모든 파일이 준비되었습니다!

## 📦 준비된 파일들
- ✅ **deploy.tar.gz** - 배포 파일 압축본 (115개 페이지 빌드 완료)
- ✅ **.env.production** - 프로덕션 환경 변수
- ✅ **ecosystem.config.js** - PM2 설정
- ✅ **server-setup.sh** - 서버 초기 설정 스크립트

## 🔧 배포 단계별 가이드

### STEP 1: 파일 전송
```bash
# 터미널에서 실행
cd "/Users/gangseungsig/Documents/02_GitHub/08_The Choi PD Ecosystem(최PD)/choi-pd-ecosystem"

# GCP 서버로 파일 전송 (사용자명 변경 필요)
scp deploy.tar.gz server-setup.sh [사용자명]@34.64.191.91:~/
```

### STEP 2: GCP 서버 접속
```bash
ssh [사용자명]@34.64.191.91
```

### STEP 3: 서버 초기 설정 (최초 1회만)
```bash
# 서버에서 실행
bash server-setup.sh
```

### STEP 4: 애플리케이션 배포
```bash
# 프로젝트 디렉토리로 이동
cd ~/choi-pd-ecosystem

# 압축 해제
tar -xzf ~/deploy.tar.gz

# 종속성 설치
npm install --production

# PM2로 시작
pm2 start ecosystem.config.js

# PM2 자동 시작 설정
pm2 save
pm2 startup
```

### STEP 5: 방화벽 설정 (GCP Console)

1. **GCP Console 접속**
   - https://console.cloud.google.com

2. **방화벽 규칙 생성**
   - VPC 네트워크 → 방화벽 규칙
   - "방화벽 규칙 만들기" 클릭

3. **설정 값 입력**
   ```
   이름: allow-8000
   트래픽 방향: 수신
   대상: 지정된 대상 태그
   대상 태그: http-8000
   소스 IP 범위: 0.0.0.0/0
   프로토콜 및 포트:
     - 체크: TCP
     - 포트: 8000
   ```

4. **VM 인스턴스에 태그 추가**
   - Compute Engine → VM 인스턴스
   - 해당 인스턴스 편집
   - 네트워크 태그에 `http-8000` 추가

## ✅ 확인

### 웹 브라우저에서 접속
```
http://34.64.191.91:8000
```

### 서버 상태 확인
```bash
# PM2 상태
pm2 status

# 로그 보기
pm2 logs impd-ecosystem

# 실시간 로그
pm2 logs impd-ecosystem --lines 100
```

## 🔧 유용한 명령어

### 서버 관리
```bash
# 재시작
pm2 restart impd-ecosystem

# 중지
pm2 stop impd-ecosystem

# 시작
pm2 start impd-ecosystem

# 삭제
pm2 delete impd-ecosystem
```

### 문제 해결
```bash
# 포트 사용 확인
sudo lsof -i :8000

# 프로세스 강제 종료
sudo kill -9 [PID]

# 로그 확인
pm2 logs --err
```

## 📝 환경 변수 수정

`.env.production` 파일에서 다음 값들을 실제 값으로 변경하세요:

```env
# Clerk 인증 (실제 키로 교체)
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE

# 암호화 키 (32자 생성)
ENCRYPTION_KEY=your_32_character_encryption_key_here_12345678
```

## 🎉 배포 완료!

모든 단계를 완료하면:
- ✅ http://34.64.191.91:8000 에서 사이트 접속 가능
- ✅ Notion 스타일 UI 적용
- ✅ 모든 페이지 정상 작동

## ❓ 도움이 필요하면

- PM2 로그 확인: `pm2 logs`
- 서버 재시작: `pm2 restart impd-ecosystem`
- 시스템 로그: `sudo journalctl -xe`

---
*Generated: 2025-12-08 23:15 KST*
*Build: 115 pages successfully compiled*
*Status: Ready for deployment*