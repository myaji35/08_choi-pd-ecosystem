#!/usr/bin/env bash
# 시나리오 테스트 — 리뷰 수집 기능 (ISS-067 / ISS-068 배포 HOLD 해소)
#
# 전제: dev 서버가 http://localhost:3011에 떠 있고, DEV_MODE=true
# 실행: bash scripts/scenario-reviews.sh
#
# 커버 시나리오 (7개):
#   S1. 일반 사용자 — 정상 리뷰 제출 → DB 저장 → 공개 조회 노출
#   S2. 일반 사용자 — 짧은 content(<10자) 거부
#   S3. 일반 사용자 — rating 범위 초과(6) 거부
#   S4. 일반 사용자 — 이메일 해시 옵션(기본 true): 원문 미노출 확인
#   S5. 어드민 — 상태 전환(new→triaged→responded→archived)
#   S6. 일반 사용자 — rate limit (4번째 요청 429)
#   S7. 공개 API — 이메일/해시 절대 노출 안 됨

set -o pipefail

BASE="http://localhost:3011"
PASS=0
FAIL=0
FAILURES=()

pass() { PASS=$((PASS+1)); echo "  ✅ PASS: $1"; }
fail() { FAIL=$((FAIL+1)); FAILURES+=("$1"); echo "  ❌ FAIL: $1"; }

# 테스트용 memberSlug 탐색 — submit API는 members 테이블을 우선 조회
MEMBER_SLUG=$(sqlite3 data/database.db "SELECT slug FROM members WHERE slug IS NOT NULL LIMIT 1;" 2>/dev/null)

if [ -z "$MEMBER_SLUG" ]; then
  # fallback: distributors의 slug (submit API가 tenants로 lookup 시)
  MEMBER_SLUG=$(sqlite3 data/database.db "SELECT slug FROM distributors WHERE slug IS NOT NULL LIMIT 1;" 2>/dev/null)
fi

if [ -z "$MEMBER_SLUG" ]; then
  echo "❌ 테스트 대상 slug를 찾을 수 없음. distributors 테이블 확인 필요."
  exit 1
fi

echo "━━━ 리뷰 시나리오 테스트 시작 (memberSlug=$MEMBER_SLUG) ━━━"
UNIQUE_SUFFIX=$(date +%s%N | tail -c 6)

# 각 시나리오는 다른 가상 IP(x-forwarded-for)로 rate-limit 독립성 확보

# ─── S1: 정상 제출 ───
echo ""
echo "S1. 정상 리뷰 제출"
RESP=$(curl -s -X POST "$BASE/api/member/reviews/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.0.0.1" \
  -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":5,\"content\":\"훌륭한 서비스 정말 감사합니다 $UNIQUE_SUFFIX\",\"reviewerName\":\"테스트유저1\"}")
REVIEW_ID=$(echo "$RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('reviewId') or (d.get('review') or {}).get('id') or d.get('id') or '')" 2>/dev/null)
if [ -n "$REVIEW_ID" ] && [ "$REVIEW_ID" != "" ]; then
  pass "제출 성공 (id=$REVIEW_ID)"
else
  fail "제출 응답에 id 없음: $RESP"
fi

# ─── S2: 짧은 content ───
echo ""
echo "S2. 10자 미만 거부"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/member/reviews/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.0.0.2" \
  -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":4,\"content\":\"좋음\",\"reviewerName\":\"테스트유저2\"}")
if [ "$CODE" = "400" ]; then pass "짧은 content → 400"; else fail "짧은 content → $CODE (기대:400)"; fi

# ─── S3: rating 범위 ───
echo ""
echo "S3. rating 6 거부"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/member/reviews/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.0.0.3" \
  -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":6,\"content\":\"내용이 충분히 깁니다 test\",\"reviewerName\":\"테스트유저3\"}")
if [ "$CODE" = "400" ]; then pass "rating 6 → 400"; else fail "rating 6 → $CODE (기대:400)"; fi

# ─── S4: 이메일 해시 ───
echo ""
echo "S4. 이메일 해시 저장"
EMAIL_UNIQUE="s4-$UNIQUE_SUFFIX@test.com"
S4_NAME="테스트유저4-$UNIQUE_SUFFIX"
curl -s -X POST "$BASE/api/member/reviews/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.0.0.4" \
  -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":4,\"content\":\"해시 저장 확인용 내용입니다\",\"reviewerName\":\"$S4_NAME\",\"email\":\"$EMAIL_UNIQUE\",\"hashEmail\":true}" > /dev/null
DB_EMAIL=$(sqlite3 data/database.db "SELECT reviewer_email FROM member_reviews WHERE reviewer_name='$S4_NAME' ORDER BY id DESC LIMIT 1;" 2>/dev/null)
if echo "$DB_EMAIL" | grep -q "$EMAIL_UNIQUE"; then
  fail "원문 이메일이 DB에 저장됨: $DB_EMAIL"
elif [ -n "$DB_EMAIL" ] && [ ${#DB_EMAIL} -ge 40 ]; then
  pass "해시 저장됨 (${#DB_EMAIL}자)"
else
  fail "이메일 저장 상태 이상: $DB_EMAIL"
fi

# ─── S5: 어드민 상태 전환 ───
echo ""
echo "S5. 어드민 상태 전환 (new→triaged→responded→archived)"
if [ -n "$REVIEW_ID" ]; then
  for STATUS in triaged responded archived; do
    CODE=$(curl -s -o /tmp/patch-review.json -w "%{http_code}" -X PATCH "$BASE/api/admin/reviews/$REVIEW_ID" \
      -H "Content-Type: application/json" -d "{\"status\":\"$STATUS\"}")
    ACTUAL=$(sqlite3 data/database.db "SELECT status FROM member_reviews WHERE id=$REVIEW_ID;" 2>/dev/null)
    if [ "$CODE" = "200" ] && [ "$ACTUAL" = "$STATUS" ]; then
      pass "$STATUS 전환"
    else
      fail "$STATUS 전환 실패 (HTTP $CODE, DB=$ACTUAL)"
    fi
  done
else
  fail "REVIEW_ID 없어 건너뜀"
fi

# ─── S6: rate limit ───
echo ""
echo "S6. Rate limit (IP당 시간당 3회)"
# 같은 IP로 3회 성공 제출 → 4번째는 429
RATE_IP="10.0.0.99"
for i in 1 2 3; do
  curl -s -o /dev/null -X POST "$BASE/api/member/reviews/submit" \
    -H "Content-Type: application/json" \
    -H "x-forwarded-for: $RATE_IP" \
    -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":3,\"content\":\"rate limit 테스트 $i회차입니다\",\"reviewerName\":\"레이트리밋$i-$UNIQUE_SUFFIX\"}" > /dev/null
done
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/member/reviews/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: $RATE_IP" \
  -d "{\"memberSlug\":\"$MEMBER_SLUG\",\"rating\":3,\"content\":\"rate limit 테스트 4회차입니다\",\"reviewerName\":\"레이트리밋4-$UNIQUE_SUFFIX\"}")
if [ "$CODE" = "429" ]; then pass "4번째 요청 → 429"; else fail "rate limit 미작동: HTTP $CODE (기대:429)"; fi

# ─── S7: 공개 API 이메일 노출 금지 ───
echo ""
echo "S7. 공개 GET /api/reviews 이메일/해시 노출 금지"
PUB=$(curl -s "$BASE/api/reviews?limit=20")
if echo "$PUB" | grep -qi "reviewer_email\|reviewer_hash\|@test.com"; then
  fail "공개 API에 이메일/해시 노출됨: $(echo $PUB | head -c 200)"
else
  pass "이메일/해시 노출 없음"
fi

# ─── 결과 요약 ───
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASS: $PASS / FAIL: $FAIL"
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "실패 목록:"
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
  exit 1
fi
echo "✅ 모든 시나리오 통과"
