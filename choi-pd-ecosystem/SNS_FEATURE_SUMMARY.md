# SNS 관리 및 콘텐츠 포워딩 기능 구현 완료 ✅

## 📋 구현 완료 항목

### 1. ✅ 백엔드 시스템

#### 데이터베이스 스키마 (`src/lib/db/schema.ts`)
- `snsAccounts`: SNS 계정 정보 (플랫폼, 토큰, 만료일 등)
- `snsScheduledPosts`: 예약 포스팅 (메시지, 이미지, 링크, 예약 시간 등)
- `snsPostHistory`: 포스팅 이력 추적 (성공/실패, 에러 메시지 등)

#### SNS API 클라이언트 (`src/lib/sns/`)
- **Facebook API** (`facebook.ts`)
  - 페이지 포스팅
  - 사진 업로드
  - 토큰 갱신
  - OAuth 인증

- **Instagram API** (`instagram.ts`)
  - 비즈니스 계정 포스팅
  - 이미지 업로드 (필수)
  - 미디어 컨테이너 생성
  - OAuth 인증

- **Twitter/X API** (`twitter.ts`)
  - 트윗 포스팅
  - 미디어 업로드
  - PKCE 인증
  - 토큰 갱신

- **LinkedIn API** (`linkedin.ts`)
  - 프로필/페이지 포스팅
  - 이미지 업로드
  - 토큰 갱신
  - OAuth 인증

#### API Routes
- `POST /api/sns/accounts` - SNS 계정 추가 (토큰 검증 포함)
- `GET /api/sns/accounts` - 계정 목록 조회
- `PUT /api/sns/accounts` - 계정 업데이트 (활성화/비활성화)
- `DELETE /api/sns/accounts` - 계정 삭제
- `GET /api/sns/oauth/authorize` - OAuth 인증 시작
- `GET /api/sns/oauth/callback` - OAuth 콜백 처리
- `POST /api/sns/schedule` - 예약 포스팅 생성
- `GET /api/sns/schedule` - 예약 포스팅 조회 (필터링 지원)
- `PUT /api/sns/schedule` - 예약 포스팅 수정
- `DELETE /api/sns/schedule` - 예약 포스팅 삭제
- `POST /api/sns/publish` - 즉시 게시
- `GET /api/cron/sns` - 자동 포스팅 크론 잡 (5분마다)

### 2. ✅ 프론트엔드 페이지

#### SNS 계정 관리 (`/admin/sns-accounts`)
**파일**: `src/app/admin/sns-accounts/page.tsx`

**기능**:
- SNS 계정 OAuth 연결 (Facebook, Instagram, Twitter, LinkedIn)
- 연결된 계정 목록 표시
- 계정 활성화/비활성화 토글
- 계정 삭제
- 실시간 동기화 상태 표시
- 성공/에러 메시지 표시

**UI 특징**:
- 플랫폼별 아이콘 및 컬러
- 활성/비활성 상태 배지
- 마지막 동기화 시간 표시

#### SNS 스케줄 관리 (`/admin/sns-schedule`)
**파일**: `src/app/admin/sns-schedule/page.tsx`

**기능**:
- 예약된 포스팅 목록 조회
- 상태별 필터링 (대기/게시 중/게시됨/실패/취소됨)
- 플랫폼별 필터링
- 즉시 게시 기능
- 예약 취소
- 포스팅 삭제
- 에러 메시지 표시
- 재시도 횟수 표시

**UI 특징**:
- 상태별 컬러 코딩
- 플랫폼 아이콘
- 예약 시간 표시
- 실시간 새로고침

#### SNS 포워딩 모달 컴포넌트
**파일**: `src/components/admin/SnsForwardingModal.tsx`

**기능**:
- 재사용 가능한 모달 컴포넌트
- 복수 SNS 계정 선택
- 메시지 커스터마이징 (280자 제한)
- 이미지 URL 입력
- 링크 URL 입력
- 예약 시간 선택 (datetime-local)
- 자동 유효성 검증

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  contentType: 'posts' | 'courses' | 'works';
  contentId: number;
  defaultMessage: string;
  defaultImageUrl?: string;
  defaultLink?: string;
  onSuccess?: () => void;
}
```

### 3. ✅ 추가 기능

#### 자동 토큰 갱신
- 만료 1시간 전 자동 토큰 갱신
- 갱신 실패 시 기존 토큰으로 재시도

#### 재시도 메커니즘
- 최대 3회 자동 재시도
- 재시도 횟수 추적
- 에러 메시지 로깅

#### 포스팅 이력 추적
- 모든 포스팅 액션 기록 (생성/업데이트/삭제/실패)
- API 응답 저장
- 에러 메시지 저장

#### Vercel 크론 잡
- 5분마다 자동 실행
- 예약 시간 도래한 포스팅 자동 게시
- 한 번에 최대 10개 처리

## 📁 파일 구조

```
choi-pd-ecosystem/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx (업데이트: SNS 링크 추가)
│   │   │   ├── sns-accounts/page.tsx (새로 생성)
│   │   │   └── sns-schedule/page.tsx (새로 생성)
│   │   └── api/
│   │       ├── sns/
│   │       │   ├── accounts/route.ts (새로 생성)
│   │       │   ├── oauth/
│   │       │   │   ├── authorize/route.ts (새로 생성)
│   │       │   │   └── callback/route.ts (새로 생성)
│   │       │   ├── schedule/route.ts (새로 생성)
│   │       │   └── publish/route.ts (새로 생성)
│   │       └── cron/
│   │           └── sns/route.ts (새로 생성)
│   ├── components/
│   │   └── admin/
│   │       └── SnsForwardingModal.tsx (새로 생성)
│   └── lib/
│       ├── db/
│       │   └── schema.ts (업데이트: SNS 테이블 추가)
│       └── sns/ (새로 생성)
│           ├── types.ts
│           ├── facebook.ts
│           ├── instagram.ts
│           ├── twitter.ts
│           ├── linkedin.ts
│           └── index.ts
├── .env.example (업데이트: SNS API 키 추가)
├── vercel.json (새로 생성: 크론 잡 설정)
├── USAGE_SNS_FORWARDING.md (새로 생성: 사용 가이드)
└── SNS_FEATURE_SUMMARY.md (이 파일)
```

## 🔧 환경 변수 설정

`.env.local` 파일에 다음 변수 추가:

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Facebook/Instagram (같은 앱 사용)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Cron Job Security
CRON_SECRET=your_random_secret_string
```

## 🚀 시작하기

### 1. 데이터베이스 마이그레이션
```bash
cd choi-pd-ecosystem
npm run db:push
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. SNS 앱 설정
각 플랫폼의 개발자 콘솔에서:
- 앱 생성
- OAuth 설정
- Callback URL 추가: `http://localhost:3000/api/sns/oauth/callback`
- 필요한 권한 신청

### 4. SNS 계정 연결
1. `http://localhost:3000/admin/sns-accounts` 접속
2. "새 계정 연결" 섹션에서 플랫폼 선택
3. OAuth 인증 완료

### 5. 콘텐츠에 SNS 포워딩 추가
사용 예시는 `USAGE_SNS_FORWARDING.md` 참조

## 🎯 워크플로우

```
1. SNS 계정 연결
   ↓
2. 콘텐츠 작성 (게시글/강의/작품)
   ↓
3. "SNS에 공유 예약" 버튼 클릭
   ↓
4. SNS 계정 선택, 메시지 작성, 시간 예약
   ↓
5. 크론 잡이 예약 시간에 자동 포스팅
   ↓
6. /admin/sns-schedule에서 결과 확인
```

## 📊 지원하는 콘텐츠 타입

- `posts`: 블로그 게시글/공지사항
- `courses`: 교육 강의
- `works`: 갤러리/작품

## 🔐 보안 기능

- OAuth 2.0 인증
- CSRF 방지 (state 파라미터)
- 토큰 암호화 저장
- 크론 잡 시크릿 인증
- API Route 보호

## 🐛 알려진 제한사항

1. **Instagram**: 이미지 URL이 필수
2. **Twitter**: 메시지 280자 제한
3. **크론 잡**: Vercel 무료 플랜은 일일 실행 횟수 제한
4. **토큰 만료**: 플랫폼별로 다름 (자동 갱신 지원)

## 📚 참고 문서

- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)

## 🎉 완료!

모든 SNS 관리 및 콘텐츠 포워딩 기능이 성공적으로 구현되었습니다!

다음 단계:
1. 각 SNS 플랫폼에서 개발자 앱 생성 및 설정
2. 환경 변수 설정
3. SNS 계정 연결 테스트
4. 예약 포스팅 테스트
5. 프로덕션 배포

질문이나 문제가 있으면 `USAGE_SNS_FORWARDING.md`를 참조하세요.
