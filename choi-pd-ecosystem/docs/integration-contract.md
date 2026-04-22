# Integration Contract — imPD 통합 연동 표준 스펙 v1

imPD가 소유한 프로젝트 생태계(Townin / CertiGraph / InsureGraph 등)와 연동하기 위한 표준 계약.
이 문서의 스펙을 구현하면 어드민 등록만으로 즉시 연동된다. 미준수 프로젝트는 `lib/integrations/adapters/<key>.ts`
어댑터로 흡수한다.

## 1. 구현해야 할 엔드포인트

```
GET {apiBaseUrl}{endpointTemplate}
```

기본 템플릿: `/api/integrations/public/{external_id}`

- `apiBaseUrl`: imPD 어드민에 등록된 값 (예: `https://api.townin.kr`)
- `{external_id}`: URL 경로 파라미터 — 해당 프로젝트의 회원 식별자 (예: `byjreporter`)
- 인증: `authType`에 따라 다음 헤더 중 하나가 붙는다.
  - `none` — 헤더 없음 (공개 데이터)
  - `api_key` — `X-API-Key: <value>`
  - `bearer` — `Authorization: Bearer <value>`
  - `oauth2` — `Authorization: Bearer <oauth_access_token>`

## 2. 응답 스키마

`200 OK` + `application/json`:

```jsonc
{
  "externalId": "byjreporter",          // 필수 — 요청 파라미터와 동일
  "displayName": "방기자",               // 필수 — 공개 페이지 헤딩
  "role": "파트너",                      // 선택 — "기자" | "전문가" | "소상공인" 등
  "profileUrl": "https://townin.kr/byjreporter",   // 필수 — 상대 프로젝트의 프로필 URL
  "publicUrl": "https://townin.kr/byjreporter",    // 선택 — publicUrl ≠ profileUrl인 경우만

  "kpis": [                             // 0~6개 권장. 많으면 앞에서부터 잘림.
    { "key": "posts", "label": "게시글", "value": 42, "unit": "건" },
    { "key": "followers", "label": "팔로워", "value": 1203, "unit": "명" },
    { "key": "impressions", "label": "노출", "value": 58400, "unit": null }
  ],

  "recentItems": [                      // 0~10개 권장. 공개 페이지 피드에 최신순으로 표기.
    {
      "id": "post-123",                 // 프로젝트 내 고유 id
      "title": "지역 카페 리뷰 #17",
      "url": "https://townin.kr/p/123",
      "type": "post",                   // post | photo | service | event ...
      "thumbnail": "https://cdn.townin.kr/123.jpg",  // 선택
      "publishedAt": "2026-04-19T10:00:00Z"
    }
  ],

  "lastActivityAt": "2026-04-21T08:30:00Z"  // 필수 — ISO8601 UTC
}
```

### 오류 응답

| 상황 | HTTP | Body |
|---|---|---|
| external_id 미존재 | `404` | `{ "error": "not_found" }` |
| 인증 실패 | `401` | `{ "error": "unauthorized" }` |
| 비공개 설정 | `403` | `{ "error": "forbidden" }` |
| 서버 오류 | `5xx` | `{ "error": "<message>" }` |

## 3. 레이트 리밋 & 캐시

- imPD 서버는 **프로젝트당 초당 10 req, 분당 300 req**를 넘지 않도록 한다.
- 호출 실패 시 어드민에 저장된 `last_snapshot_json`으로 graceful degrade 한다.
- 권장 캐시 TTL: 공개 페이지는 60초, 어드민 상세는 0초(항상 fresh).

## 4. 어드민 등록 절차

1. `/admin/integration-projects/new`에서 프로젝트 등록
   - `key`: 영소문자/숫자/하이픈 (예: `townin`). 이후 변경 불가.
   - `baseUrl`: 공개 사이트 URL
   - `apiBaseUrl`: 표준 엔드포인트 호스트
   - `endpointTemplate`: 경로 템플릿 (기본값 권장)
   - `authType` + `authCredential`
2. 회원(distributor) 상세 페이지의 "연동" 탭에서 프로젝트 선택 + `externalId` 입력
3. "테스트 호출" 버튼으로 200 응답 확인 → "공개 토글" ON
4. 공개 페이지(`/<slug>`)에 프로젝트별 성과 섹션이 자동 노출

## 5. 어댑터 (레거시 흡수 경로)

표준 스펙을 구현하기 어려운 레거시 프로젝트는 어댑터로 흡수:

```ts
// src/lib/integrations/adapters/townin-legacy.ts
export async function fetchSnapshot(project, externalId): Promise<StandardSnapshot> {
  const res = await fetch(`${project.baseUrl}/legacy/api/${externalId}.json`);
  const raw = await res.json();
  return {
    externalId,
    displayName: raw.nickname,
    role: raw.user_role,
    profileUrl: `${project.baseUrl}/${externalId}`,
    kpis: [
      { key: 'posts', label: '게시글', value: raw.post_count, unit: '건' },
    ],
    recentItems: raw.items.slice(0, 10).map((it) => ({ ... })),
    lastActivityAt: raw.updated_at,
  };
}
```

어드민에서 `adapterKey = 'townin-legacy'`로 등록하면 표준 호출 대신 어댑터가 실행된다.

## 6. 변경 이력

- v1 (2026-04-22) — 초안. ISS-072 HUB-P0.
