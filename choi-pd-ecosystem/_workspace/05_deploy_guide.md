# 05. imPD SaaS 배포 가이드

## 1. 인프라 개요

| 항목 | 값 |
|------|-----|
| 서버 | Vultr ICN (158.247.235.31) |
| OS | Ubuntu (Docker 기반) |
| 리버스 프록시 | kamal-proxy |
| 메인 도메인 | `impd.158.247.235.31.nip.io` |
| 와일드카드 도메인 | `*.impd.158.247.235.31.nip.io` |
| 컨테이너 포트 | 3300(호스트) → 3000(컨테이너) |
| Docker 네트워크 | `kamal` |

---

## 2. 환경변수 목록

### 기존 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NODE_ENV` | 실행 환경 | `production` |
| `PORT` | 컨테이너 내부 포트 | `3000` |
| `DATABASE_URL` | SQLite DB 경로 | `file:./data/database.db` |
| `JWT_SECRET` | JWT 서명 키 | 자동 생성 |
| `ENCRYPTION_KEY` | 암호화 키 (32자+) | 자동 생성 |
| `TZ` | 타임존 | `Asia/Seoul` |

### SaaS 전환으로 추가된 환경변수

| 변수명 | 설명 | 예시 | 필수 |
|--------|------|------|------|
| `BASE_DOMAIN` | 멀티테넌트 베이스 도메인 | `impd.158.247.235.31.nip.io` | O |
| `NEXT_PUBLIC_BASE_DOMAIN` | 클라이언트용 베이스 도메인 | `impd.158.247.235.31.nip.io` | O |
| `STRIPE_SECRET_KEY` | Stripe 시크릿 키 | `sk_live_...` | Phase 3 |
| `STRIPE_WEBHOOK_SECRET` | Stripe 웹훅 시크릿 | `whsec_...` | Phase 3 |

---

## 3. 서브도메인 설정

### 3.1 nip.io 와일드카드 원리

nip.io는 DNS 서비스로, 별도 DNS 설정 없이 와일드카드 서브도메인을 지원한다.

```
chopd.impd.158.247.235.31.nip.io  → 158.247.235.31
kimrealtor.impd.158.247.235.31.nip.io → 158.247.235.31
anything.impd.158.247.235.31.nip.io → 158.247.235.31
```

모든 `*.impd.158.247.235.31.nip.io` 요청이 동일 서버 IP로 해석된다.

### 3.2 라우팅 흐름

```
브라우저 → nip.io DNS → 158.247.235.31
  → kamal-proxy (와일드카드 매칭)
  → Docker 컨테이너 (포트 3000)
  → Next.js middleware (서브도메인에서 tenantSlug 추출)
  → x-tenant-slug 헤더 주입 → API/페이지 렌더링
```

### 3.3 테넌트 URL 패턴

| URL | 용도 |
|-----|------|
| `impd.158.247.235.31.nip.io` | 메인 랜딩/온보딩 |
| `chopd.impd.158.247.235.31.nip.io` | 최PD 테넌트 (기본) |
| `{slug}.impd.158.247.235.31.nip.io` | 개별 테넌트 공개 페이지 |
| `{slug}.impd.158.247.235.31.nip.io/admin` | 테넌트 어드민 |
| `{slug}.impd.158.247.235.31.nip.io/dashboard` | 테넌트 대시보드 |
| `app.impd.158.247.235.31.nip.io` | 슈퍼어드민 (Phase 4) |

### 3.4 프로덕션 도메인 전환 시

`BASE_DOMAIN` 환경변수만 변경하면 된다:

```bash
# 현재 (nip.io)
BASE_DOMAIN=impd.158.247.235.31.nip.io

# 프로덕션 (커스텀 도메인)
BASE_DOMAIN=impd.io
```

DNS에서 `*.impd.io`를 서버 IP로 A 레코드 등록 필요.

---

## 4. 배포 절차

### 4.1 일반 배포

```bash
cd choi-pd-ecosystem
bin/deploy
```

### 4.2 전체 재빌드 (캐시 무시)

```bash
bin/deploy --full
```

### 4.3 컨테이너 재시작만

```bash
bin/deploy --restart
```

### 4.4 배포 스크립트가 수행하는 작업

1. **소스 전송** (rsync) — node_modules, .next, data 제외
2. **Docker 빌드** — 멀티스테이지 (deps → builder → runner)
3. **컨테이너 배포**:
   - 기존 컨테이너 중지/삭제
   - 새 컨테이너 시작 (환경변수 포함)
   - 헬스체크 (최대 90초)
   - kamal-proxy 등록 (메인 + 와일드카드)
4. **정리** — 오래된 이미지 삭제 (최근 3개 유지)

---

## 5. DB 마이그레이션 순서

### 5.1 SaaS 전환 마이그레이션 (Phase 1)

```bash
# 1. 새 마이그레이션 생성
npm run db:generate

# 2. 로컬에서 마이그레이션 테스트
npm run db:push

# 3. 시드 데이터 적용 (기본 테넌트 생성)
npm run db:seed

# 4. 배포 (컨테이너 내부에서 자동 마이그레이션)
bin/deploy
```

### 5.2 마이그레이션 체크리스트

- [ ] `tenants` 테이블 생성 (id, slug, name, plan, profession, createdAt)
- [ ] `tenantMembers` 테이블 생성 (userId, tenantId, role)
- [ ] 기존 테이블에 `tenantId` 컬럼 추가 (nullable, default=1)
- [ ] 기본 테넌트 (id=1, slug='chopd') 시드 데이터 삽입
- [ ] 기존 데이터 `tenantId=1`로 업데이트
- [ ] 복합 인덱스 추가 (tenant_id + id, tenant_id + created_at)

### 5.3 마이그레이션 실행 순서 원칙

```
1. 새 테이블 생성 (CREATE TABLE)
2. 기존 테이블에 컬럼 추가 (ALTER TABLE ADD COLUMN)
3. 시드 데이터 삽입 (INSERT INTO tenants)
4. 기존 데이터 업데이트 (UPDATE ... SET tenantId = 1)
5. 인덱스 생성 (CREATE INDEX)
```

> SQLite는 트랜잭션 내 ALTER TABLE에 제약이 있으므로, 각 단계를 별도 마이그레이션으로 분리한다.

---

## 6. 롤백 절차

### 6.1 컨테이너 롤백 (이전 이미지로)

```bash
# 서버에 SSH 접속
ssh root@158.247.235.31

# 사용 가능한 이미지 확인
docker images impd --format "{{.Tag}} {{.CreatedAt}}"

# 현재 컨테이너 중지
docker stop impd && docker rm impd

# 이전 이미지로 시작 (TIMESTAMP를 실제 태그로 교체)
docker run -d \
  --name impd \
  --restart unless-stopped \
  --network kamal \
  --memory=2g --memory-swap=4g \
  -p 3300:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=file:./data/database.db \
  -e BASE_DOMAIN=impd.158.247.235.31.nip.io \
  -e TZ=Asia/Seoul \
  -v impd_data:/app/data \
  -v impd_uploads:/app/public/uploads \
  impd:20260330_120000  # ← 이전 태그
```

### 6.2 DB 롤백

SQLite 파일 기반이므로 볼륨 백업에서 복원한다.

```bash
# 서버에서 DB 백업 목록 확인
ssh root@158.247.235.31 "ls -la /opt/impd-backups/"

# 백업에서 복원
ssh root@158.247.235.31 << 'EOF'
docker stop impd
# 현재 DB 백업
docker run --rm -v impd_data:/data -v /opt/impd-backups:/backup alpine \
  cp /data/database.db /backup/database.db.rollback-$(date +%Y%m%d_%H%M%S)

# 이전 백업으로 복원
docker run --rm -v impd_data:/data -v /opt/impd-backups:/backup alpine \
  cp /backup/database.db.YYYYMMDD /data/database.db

docker start impd
EOF
```

### 6.3 kamal-proxy 롤백

```bash
ssh root@158.247.235.31 << 'EOF'
# 와일드카드 서비스 제거 (문제 시)
docker exec kamal-proxy kamal-proxy remove impd-wildcard

# 메인 도메인만 유지
docker exec kamal-proxy kamal-proxy list
EOF
```

---

## 7. 헬스체크 엔드포인트

### 7.1 기본 헬스체크

```
GET /api/health
```

응답: `200 OK` + JSON body

### 7.2 수동 헬스체크

```bash
# 메인 도메인
curl -s https://impd.158.247.235.31.nip.io/api/health

# 와일드카드 서브도메인
curl -s https://chopd.impd.158.247.235.31.nip.io/api/health

# 직접 접속 (포트)
curl -s http://158.247.235.31:3300/api/health
```

### 7.3 컨테이너 내부 상태

```bash
ssh root@158.247.235.31 "docker inspect impd --format '{{.State.Health.Status}}'"
```

---

## 8. 모니터링 및 로그

### 8.1 실시간 로그

```bash
ssh root@158.247.235.31 "docker logs -f impd --tail 50"
```

### 8.2 리소스 사용량

```bash
ssh root@158.247.235.31 "docker stats impd --no-stream"
```

### 8.3 kamal-proxy 상태

```bash
ssh root@158.247.235.31 "docker exec kamal-proxy kamal-proxy list"
```

---

## 9. 트러블슈팅

### 서브도메인이 작동하지 않는 경우

1. **nip.io DNS 확인**: `nslookup chopd.impd.158.247.235.31.nip.io` → 158.247.235.31 반환 확인
2. **kamal-proxy 와일드카드 등록 확인**: `docker exec kamal-proxy kamal-proxy list`
3. **컨테이너 로그 확인**: `docker logs impd --tail 20`
4. **미들웨어 디버깅**: `/api/health` 응답 헤더에서 `x-tenant-slug` 확인

### 컨테이너가 시작되지 않는 경우

1. **이미지 빌드 확인**: `docker images impd`
2. **포트 충돌**: `lsof -i :3300`
3. **메모리 부족**: `docker stats --no-stream`
4. **DB 파일 권한**: `docker exec impd ls -la /app/data/`

### SSL 인증서 문제 (nip.io)

nip.io는 Let's Encrypt 와일드카드 인증서를 자동 발급하지 않는다. kamal-proxy가 자체 TLS termination을 처리한다. 프로덕션 커스텀 도메인으로 전환 시 Caddy 또는 Traefik으로 SSL 자동화 구성이 필요하다.
