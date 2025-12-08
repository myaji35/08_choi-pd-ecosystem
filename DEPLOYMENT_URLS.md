# 배포 URL 및 접속 정보

## 프로덕션 서버 접속 정보

### 메인 URL
- **IP 주소 접속**: http://58.255.113.125
- **도메인 (설정 예정)**: https://impd.co.kr
- **www 도메인**: https://www.impd.co.kr

### 개발/테스트 접속
- **Direct Port Access** (Nginx 없이): http://58.255.113.125:3011
  - ⚠️ 주의: 방화벽 설정에 따라 직접 포트 접근이 차단될 수 있음

## 서버 정보
| 항목 | 값 |
|------|-----|
| **서버 IP** | 58.255.113.125 |
| **애플리케이션 포트** | 3011 |
| **웹 서버** | Nginx |
| **OS** | Ubuntu/Linux |
| **Node.js 버전** | v20.x LTS |

## 접속 경로별 URL

### 사용자 페이지
- 홈페이지: `http://58.255.113.125/`
- 교육: `http://58.255.113.125/education`
- 미디어: `http://58.255.113.125/media`
- 작품: `http://58.255.113.125/works`
- 커뮤니티: `http://58.255.113.125/community`

### 관리자 페이지
- 배포 플랫폼 관리자: `http://58.255.113.125/admin`
  - 대시보드: `/admin/dashboard`
  - 유통사 관리: `/admin/distributors`
  - 리소스 관리: `/admin/resources`
  - 결제 관리: `/admin/payments`

- PD 개인 대시보드: `http://58.255.113.125/pd`
  - 대시보드: `/pd/dashboard`
  - SNS 계정 관리: `/pd/sns-accounts`
  - 예약 게시: `/pd/scheduled-posts`
  - 칸반 보드: `/pd/kanban`

### API 엔드포인트
- Health Check: `http://58.255.113.125/api/health`
- API 문서: `http://58.255.113.125/api/docs` (설정 시)

## SSL/HTTPS 설정 상태
- [ ] SSL 인증서 미설정
- [ ] HTTP → HTTPS 리다이렉션 미설정
- [ ] HSTS 헤더 미설정

SSL 설정 후:
- https://58.255.113.125 (자체 서명 인증서 경고)
- https://impd.co.kr (도메인 설정 후)

## DNS 설정 (도메인 구매 후)

도메인 DNS 설정:
```
Type    Name    Value           TTL
A       @       58.255.113.125  300
A       www     58.255.113.125  300
CNAME   api     @               300
CNAME   admin   @               300
```

## 모니터링 URL

### 외부 모니터링
- UptimeRobot: 설정 예정
- Google Search Console: 설정 예정
- Google Analytics: 설정 예정

### 내부 모니터링
- PM2 Monitor: `pm2 monit` (SSH 접속 필요)
- Nginx Status: `/nginx_status` (설정 필요)

## 백업 서버 (향후)
- 백업 서버 IP: 미정
- 백업 URL: 미정
- 페일오버 설정: 미정

## 개발 환경 URL
- 로컬 개발: `http://localhost:3011`
- 개발 서버: 미설정

## 테스트 방법

### 서버 접속 확인
```bash
# ping 테스트
ping 58.255.113.125

# HTTP 접속 테스트
curl -I http://58.255.113.125

# 포트 접속 테스트
telnet 58.255.113.125 80
```

### 애플리케이션 상태 확인
```bash
# Health check
curl http://58.255.113.125/api/health

# 메인 페이지 로드
curl -s http://58.255.113.125 | grep "<title>"
```

## 접속 문제 해결

### 접속 불가 시 확인사항
1. 서버 전원 상태
2. 네트워크 연결 상태
3. Nginx 서비스 상태
4. Node.js 애플리케이션 상태
5. 방화벽 규칙

### 관리자 연락처
- 서버 관리자: [관리자 정보 입력]
- 기술 지원: [지원 연락처 입력]

## 업데이트 기록
| 날짜 | 변경사항 |
|------|----------|
| 2024-12-08 | 초기 배포 설정 |
| - | SSL 인증서 설치 예정 |
| - | 도메인 연결 예정 |

---
*Last Updated: 2024-12-08*