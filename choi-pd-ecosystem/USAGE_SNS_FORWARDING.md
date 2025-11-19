# SNS 포워딩 기능 사용 가이드

## 개요

SNS 포워딩 기능을 사용하면 콘텐츠(게시글, 강의, 작품)를 Facebook, Instagram, Twitter/X, LinkedIn에 자동으로 예약 포스팅할 수 있습니다.

## 설치된 컴포넌트

### 1. SNS 계정 관리 페이지
- 경로: `/admin/sns-accounts`
- 기능:
  - SNS 계정 OAuth 연결
  - 계정 활성화/비활성화
  - 계정 삭제

### 2. SNS 스케줄 관리 페이지
- 경로: `/admin/sns-schedule`
- 기능:
  - 예약된 포스팅 목록 조회
  - 필터링 (상태, 플랫폼)
  - 즉시 게시
  - 예약 취소/삭제

### 3. SNS 포워딩 모달 컴포넌트
- 경로: `src/components/admin/SnsForwardingModal.tsx`
- 재사용 가능한 모달 컴포넌트

## 사용 방법

### 콘텐츠 편집 페이지에 SNS 포워딩 버튼 추가

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { SnsForwardingModal } from '@/components/admin/SnsForwardingModal';

export default function ContentEditPage() {
  const [showSnsModal, setShowSnsModal] = useState(false);

  // 예시 데이터
  const contentType = 'posts'; // 'posts' | 'courses' | 'works'
  const contentId = 1;
  const contentTitle = '새로운 스마트폰 창업 강의 오픈!';
  const contentImageUrl = 'https://example.com/image.jpg';
  const contentLink = 'https://yourdomain.com/education/course/1';

  return (
    <div>
      {/* 기존 콘텐츠 편집 UI */}

      {/* SNS 포워딩 버튼 */}
      <Button
        onClick={() => setShowSnsModal(true)}
        variant="outline"
        className="w-full"
      >
        <Share2 className="mr-2 h-4 w-4" />
        SNS에 공유 예약
      </Button>

      {/* SNS 포워딩 모달 */}
      <SnsForwardingModal
        isOpen={showSnsModal}
        onClose={() => setShowSnsModal(false)}
        contentType={contentType}
        contentId={contentId}
        defaultMessage={contentTitle}
        defaultImageUrl={contentImageUrl}
        defaultLink={contentLink}
        onSuccess={() => {
          alert('SNS 포워딩이 예약되었습니다!');
          // 필요시 추가 액션
        }}
      />
    </div>
  );
}
```

### Props 설명

| Prop | Type | 필수 | 설명 |
|------|------|------|------|
| `isOpen` | `boolean` | ✅ | 모달 표시 여부 |
| `onClose` | `() => void` | ✅ | 모달 닫기 핸들러 |
| `contentType` | `'posts' \| 'courses' \| 'works'` | ✅ | 콘텐츠 타입 |
| `contentId` | `number` | ✅ | 콘텐츠 ID |
| `defaultMessage` | `string` | ✅ | 기본 메시지 (편집 가능) |
| `defaultImageUrl` | `string` | ❌ | 기본 이미지 URL |
| `defaultLink` | `string` | ❌ | 기본 링크 URL |
| `onSuccess` | `() => void` | ❌ | 성공 시 콜백 |

## 필요한 shadcn/ui 컴포넌트 설치

```bash
# Dialog 컴포넌트
npx shadcn@latest add dialog

# Checkbox 컴포넌트
npx shadcn@latest add checkbox

# Select 컴포넌트
npx shadcn@latest add select

# Textarea 컴포넌트 (이미 있을 수 있음)
npx shadcn@latest add textarea
```

## 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Facebook/Instagram
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

## SNS 앱 설정 가이드

### Facebook/Instagram
1. [Facebook Developers](https://developers.facebook.com/) 접속
2. 새 앱 만들기
3. Facebook Login 제품 추가
4. 설정 > 기본 설정에서 App ID와 App Secret 복사
5. 앱 검수 및 권한 신청:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`

### Twitter/X
1. [Twitter Developer Portal](https://developer.twitter.com/) 접속
2. 프로젝트 및 앱 생성
3. OAuth 2.0 활성화
4. Client ID와 Client Secret 복사
5. Callback URL 추가: `https://yourdomain.com/api/sns/oauth/callback`

### LinkedIn
1. [LinkedIn Developers](https://www.linkedin.com/developers/) 접속
2. 새 앱 만들기
3. Auth > OAuth 2.0 설정
4. Client ID와 Client Secret 복사
5. Redirect URLs 추가: `https://yourdomain.com/api/sns/oauth/callback`

## 크론 잡 설정 (자동 포스팅)

Vercel에 배포 시 자동으로 5분마다 크론 잡이 실행됩니다 (`vercel.json` 참조).

로컬에서 테스트하려면:

```bash
# 크론 잡 수동 실행
curl http://localhost:3000/api/cron/sns \
  -H "Authorization: Bearer your_cron_secret"
```

## 워크플로우

1. **계정 연결**: `/admin/sns-accounts`에서 SNS 계정 연결
2. **콘텐츠 작성**: 게시글/강의/작품 작성
3. **SNS 포워딩**: "SNS에 공유 예약" 버튼 클릭
4. **예약 설정**:
   - SNS 계정 선택 (복수 선택 가능)
   - 메시지 커스터마이징
   - 예약 시간 설정
5. **자동 게시**: 크론 잡이 예약 시간에 자동으로 포스팅 실행
6. **모니터링**: `/admin/sns-schedule`에서 상태 확인

## 주의사항

- **Instagram**: 이미지가 필수입니다
- **Twitter**: 메시지는 280자 제한
- **재시도**: 실패 시 자동으로 최대 3회 재시도
- **토큰 갱신**: 토큰이 만료되기 전 자동으로 갱신됩니다

## 트러블슈팅

### "SNS 계정을 불러오는데 실패했습니다"
- API 엔드포인트가 정상 동작하는지 확인
- 네트워크 탭에서 에러 확인

### "이미지가 필수입니다" (Instagram)
- Instagram 선택 시 이미지 URL을 반드시 입력하세요

### "토큰이 만료되었습니다"
- `/admin/sns-accounts`에서 해당 계정을 삭제 후 재연결

### 크론 잡이 실행되지 않음
- Vercel 환경 변수에 `CRON_SECRET` 설정 확인
- Vercel 로그에서 크론 잡 실행 여부 확인

## API 엔드포인트

- `GET /api/sns/accounts` - 계정 목록 조회
- `POST /api/sns/accounts` - 계정 추가
- `PUT /api/sns/accounts` - 계정 업데이트
- `DELETE /api/sns/accounts` - 계정 삭제
- `GET /api/sns/oauth/authorize` - OAuth 인증 시작
- `GET /api/sns/oauth/callback` - OAuth 콜백
- `GET /api/sns/schedule` - 예약 포스팅 조회
- `POST /api/sns/schedule` - 예약 포스팅 생성
- `PUT /api/sns/schedule` - 예약 포스팅 업데이트
- `DELETE /api/sns/schedule` - 예약 포스팅 삭제
- `POST /api/sns/publish` - 즉시 게시
- `GET /api/cron/sns` - 크론 잡 (자동 실행)
