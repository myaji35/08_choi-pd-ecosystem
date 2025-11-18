# 히어로 섹션 (Hero Section) Phase 0 연구 문서

**프로젝트**: 최범희 대표 통합 브랜드 허브 웹사이트
**기능**: Home 페이지 히어로 섹션
**작성일**: 2025년 11월 18일
**상태**: 초안

---

## 1. Next.js 이미지 최적화 베스트 프랙티스

### 1.1 Next.js Image 컴포넌트 사용법

#### 결정 (Decision)
Next.js의 `next/image` 컴포넌트를 모든 히어로 섹션 배경 이미지, 프로필 사진, 서비스 아이콘에 필수 적용합니다.

#### 근거 (Rationale)
- **자동 최적화**: WebP 포맷 변환, 크롭, 리사이징을 자동으로 처리하여 개발자 부담 감소
- **네이티브 지연 로딩**: `loading="lazy"` 속성으로 뷰포트 외 이미지는 자동 지연 로딩
- **성능 메트릭**: Largest Contentful Paint (LCP) 개선, Core Web Vitals 점수 향상
- **브라우저 호환성**: 자동 폴백으로 WebP 미지원 브라우저도 JPEG/PNG 제공

#### 고려한 대안 (Alternatives Considered)
1. **HTML `<img>` 태그**: 수동 최적화 필요, 개발 시간 증가, 성능 저하 위험
2. **외부 CDN 직연결**: 관리 복잡도 증가, Next.js와의 동기화 어려움
3. **CSS background-image**: 이미지 로딩 순서 제어 불가, 반응형 처리 복잡

#### 구현 가이드

```typescript
// 히어로 배경 이미지 예제
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="/images/hero-bg.jpg"
        alt="최범희 PD 히어로 배경"
        fill
        priority // LCP 이미지는 priority 설정
        quality={85} // 품질: 기본값 75, 히어로는 85-95
        className="object-cover object-center"
      />
      {/* 컨텐츠 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
```

**핵심 속성 설명**:
- `fill`: 부모 container 크기에 맞춤 (반응형 자동 처리)
- `priority`: LCP 이미지는 반드시 설정하여 미리 로드
- `quality`: 1-100 (기본값 75), 디스플레이 품질 vs 파일 크기 트레이드오프
- `object-cover`: CSS로 종횡비 유지하며 컨테이너 채움

---

### 1.2 WebP 포맷 변환 및 반응형 이미지

#### 결정 (Decision)
이미지 소스 파일은 JPG/PNG로 관리하고, Next.js 이미지 최적화 API가 자동으로 WebP 변환 및 제공합니다. 필요시 `srcSet` 기반 수동 반응형 처리는 최소화합니다.

#### 근거 (Rationale)
- **자동 변환**: Next.js 내장 Sharp 라이브러리가 온-디맨드 WebP 생성 및 캐싱
- **파일 크기**: WebP는 JPG 대비 20-35% 작음, 모바일 대역폭 절감
- **브라우저 지원**: 최신 브라우저 99% 이상 WebP 지원, 자동 폴백으로 호환성 확보

#### 고려한 대안 (Alternatives Considered)
1. **사전 WebP 변환**: 빌드 시점에 모든 이미지 변환 → 빌드 시간 증가, 캐시 무효화 복잡
2. **클라우드 기반 변환**: Cloudinary, ImageKit 사용 → 외부 의존성, 비용 발생
3. **수동 srcSet 관리**: 각 해상도별 이미지 수동 생성 → 관리 오버헤드 큼

#### 구현 가이드

```typescript
// 다양한 화면 크기 대응 반응형 이미지
import Image from 'next/image';

export default function ResponsiveHeroImage() {
  return (
    <Image
      src="/images/hero-profile.jpg"
      alt="최범희 대표 프로필"
      width={400}
      height={500}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="w-full h-auto"
    />
  );
}
```

**sizes 속성 가이드**:
- `(max-width: 640px) 100vw`: 모바일(≤640px) → 뷰포트 100%
- `(max-width: 1024px) 50vw`: 태블릿(641-1024px) → 뷰포트 50%
- `33vw`: 데스크톱(>1024px) → 뷰포트 33%

**최적화 결과**:
- 모바일: 원본 2000x2500px → 640x800px로 자동 리사이징
- 태블릿: 1200x1500px
- 데스크톱: 1600x2000px (또는 원본)
- 모든 크기에 WebP 제공

---

### 1.3 지연 로딩 (Lazy Loading) 전략

#### 결정 (Decision)
LCP 이미지(히어로 배경, 상단 프로필)는 `priority` 설정, 하단 서비스 카드 이미지는 `loading="lazy"` 자동 처리합니다.

#### 근거 (Rationale)
- **LCP 최적화**: 히어로 배경은 페이지 로드 시 첫 번째 시각적 요소 → 우선 로드 필수
- **라우트 내 성능**: 서비스 카드(하단)는 스크롤 후 표시 → 지연 로딩으로 초기 로드 시간 단축
- **대역폭 절감**: 모바일 사용자가 스크롤하지 않으면 하단 이미지 전송 안 함

#### 고려한 대안 (Alternatives Considered)
1. **모든 이미지 priority 설정**: 페이지 로드 시간 증가, 실제 필요 이미지만 미리 로드해야 함
2. **Intersection Observer 수동 구현**: 복잡도 증가, 자동 지연 로딩 기능 중복
3. **CDN 스마트 로딩**: 외부 서비스 의존, 캐시 관리 복잡

#### 구현 가이드

```typescript
// 히어로 섹션 - LCP 이미지 (priority 설정)
<Image
  src="/images/hero-bg-main.jpg"
  alt="히어로 배경"
  fill
  priority // 중요: 이 속성이 LCP 최적화의 핵심
  quality={90}
  className="object-cover"
/>

// 서비스 카드 섹션 - 지연 로딩
<Image
  src="/images/education-card.jpg"
  alt="교육 서비스"
  width={300}
  height={200}
  loading="lazy" // 기본값이지만 명시적으로 표시
  className="rounded-lg"
/>
```

**성능 개선 예상치**:
- priority 이미지 LCP: ~1.5초 → ~0.8초 (47% 개선)
- 초기 페이지 로드 크기: ~2.5MB → ~1.8MB (28% 감소)

---

### 1.4 LCP 최적화 기법

#### 결정 (Decision)
히어로 섹션 LCP 달성 목표: 2.5초 이내. 우선순위: 이미지 최적화 > 폰트 최적화 > 레이아웃 최적화

#### 근거 (Rationale)
- **LCP 정의**: 페이지의 가장 큰 콘텐츠가 화면에 표시되는 시간
- **히어로의 LCP**: 배경 이미지 또는 프로필 사진이 최대 콘텐츠 요소
- **SEO 영향**: Core Web Vitals 중 LCP 점수는 Google 검색 순위에 직접 영향 (2024년 이후)

#### 고려한 대안 (Alternatives Considered)
1. **서버 렌더링 최적화만**: 클라이언트 이미지 로딩 병목 미처리
2. **이미지 압축만**: 폰트 로드 지연도 함께 최적화 필요
3. **코드 분할**: 히어로 섹션은 위폴드(above-the-fold) → 분할 효과 미미

#### 구현 체크리스트

```typescript
// ✅ 1단계: 이미지 최적화
- [ ] 히어로 배경: priority 설정
- [ ] 이미지 크기: 원본 2000x1200px 이상 권장
- [ ] 품질: quality={85} 또는 90
- [ ] 포맷: JPG (WebP 자동 변환)

// ✅ 2단계: 폰트 최적화
- [ ] system font 사용 또는 `next/font`로 최적화된 폰트 로드
- [ ] font-display: swap (텍스트 먼저 표시, 폰트 로드 후 교체)

export const pretendard = localFont({
  src: [
    {
      path: '../fonts/Pretendard-Regular.woff2',
      weight: '400',
    },
  ],
  fallback: ['system-ui', 'sans-serif'],
});

// ✅ 3단계: 레이아웃 최적화
- [ ] skeleton loading 또는 placeholder 사용
- [ ] 이미지 컨테이너 종횡비 사전 설정 (CLS 방지)

<div className="relative aspect-video bg-gray-200">
  <Image
    src="/hero.jpg"
    alt="히어로"
    fill
    className="object-cover"
  />
</div>

// ✅ 4단계: 네트워크 최적화
- [ ] 초기 페이지 로드 크기 < 100KB (HTML+CSS)
- [ ] 이미지 총합 < 2MB
- [ ] 자바스크립트 번들 < 50KB (히어로 섹션 관련)
```

**LCP 측정 도구**:
- Chrome DevTools (Lighthouse)
- PageSpeed Insights (https://pagespeed.web.dev)
- WebPageTest (https://www.webpagetest.org)

---

## 2. Google Cloud Storage (GCS) 통합

### 2.1 Node.js에서 GCS SDK 사용법

#### 결정 (Decision)
히어로 섹션 이미지 및 모든 동적 콘텐츠 이미지는 Google Cloud Storage에 저장하고, Next.js API Routes를 통해 서명된 URL을 생성하여 클라이언트에 제공합니다.

#### 근거 (Rationale)
- **확장성**: 로컬 파일 시스템의 용량 제약 없음, 무제한 저장 가능
- **보안**: 서명된 URL로 임시 접근 권한 부여, 직접 접근 방지
- **글로벌 배포**: GCS와 Next.js 연동으로 전 세계 CDN 자동 지원
- **비용 효율**: 소규모 운영 시 월 $0-5 범위, 트래픽에 따른 탄력적 비용

#### 고려한 대안 (Alternatives Considered)
1. **로컬 파일 시스템**: 관리 간편하지만 백업, 확장성 제약 큼
2. **AWS S3**: 기능 동일하지만 GCP 생태계와 통합 용이
3. **Cloudinary**: 관리 편하지만 월 $10-50 비용, 벤더 락인 위험

#### 구현 가이드

##### 2.1.1 GCS SDK 설치 및 초기화

```bash
npm install @google-cloud/storage
```

```typescript
// lib/gcs.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE_PATH,
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
```

##### 2.1.2 환경 변수 설정

```bash
# .env.local
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=choi-pd-images
GCP_KEY_FILE_PATH=/path/to/service-account-key.json
```

**GCP 서비스 계정 키 생성**:
1. GCP Console → 프로젝트 선택
2. "서비스 계정" 메뉴 → "새 서비스 계정" 생성
3. 역할: Storage Admin (또는 Storage Object Creator)
4. JSON 키 다운로드 → 프로젝트 루트의 `.gcp` 디렉토리에 저장
5. `.gitignore`에 추가: `.gcp/` 와 서비스 계정 JSON 파일

##### 2.1.3 이미지 업로드 API Route

```typescript
// app/api/upload-image/route.ts
import { bucket } from '@/lib/gcs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const filename = `hero/${Date.now()}-${file.name}`;
    const gcsFile = bucket.file(filename);

    await gcsFile.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    });

    // 서명된 URL 생성 (24시간 유효)
    const [signedUrl] = await gcsFile.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      success: true,
      url: signedUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('GCS 업로드 오류:', error);
    return NextResponse.json(
      { error: '이미지 업로드 실패' },
      { status: 500 }
    );
  }
}
```

---

### 2.2 서명된 URL 생성

#### 결정 (Decision)
모든 GCS 저장 이미지는 서명된 URL을 통해서만 접근 가능하며, 유효 기간은 용도별로 설정합니다:
- 히어로/공개 이미지: 7일 (자주 변경 안 됨)
- 임시 이미지(갤러리 임시): 24시간
- 관리자 미리보기: 1시간

#### 근거 (Rationale)
- **보안**: 직접 URL 노출 방지, 무단 접근 차단
- **캐시 제어**: 만료 시 자동으로 새 URL 필요 → CDN 캐시 무효화 자동 처리
- **접근 로깅**: GCS 로그에 모든 접근 기록 → 통계 및 감시 가능

#### 고려한 대안 (Alternatives Considered)
1. **무제한 공개 URL**: 관리 간편하지만 보안 위험, 비용 제어 불가
2. **임시 토큰 기반**: URL보다 복잡하지만 더 세밀한 제어 가능 (필요 시 Phase 2)

#### 구현 예제

```typescript
// lib/gcs-url.ts
import { bucket } from '@/lib/gcs';

export async function getSignedUrl(
  filename: string,
  expiresInHours: number = 24
) {
  const file = bucket.file(filename);

  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInHours * 60 * 60 * 1000,
  });

  return signedUrl;
}

// 사용 예제: 히어로 배경 이미지 조회
export async function getHeroImageUrl() {
  // DB에서 filename 조회
  const filename = 'hero/main-bg-2025.jpg';

  // 7일 유효 서명 URL 생성
  return getSignedUrl(filename, 24 * 7); // 7일
}
```

---

### 2.3 업로드 실패 시 재시도 전략

#### 결정 (Decision)
GCS 업로드 실패 시 지수 백오프(exponential backoff) 방식으로 최대 3회 재시도하며, 각 시도 간 대기 시간은 1초, 2초, 4초입니다.

#### 근거 (Rationale)
- **네트워크 일시적 오류**: 순간적인 연결 끊김 → 재시도로 해결 가능
- **GCS API 제한**: 과도한 동시 요청 시 429 에러 → 지수 백오프로 자동 조정
- **사용자 경험**: 재시도로 업로드 성공률 95% 이상으로 개선 가능

#### 고려한 대안 (Alternatives Considered)
1. **재시도 없음**: 네트워크 불안정 환경에서 실패율 높음
2. **무한 재시도**: 네트워크 장애 시 무한 대기, 사용자 경험 악화
3. **큐 기반 재시도**: 백그라운드 작업 필요, 인프라 복잡도 증가 (Phase 2)

#### 구현 코드

```typescript
// lib/gcs-retry.ts
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function uploadWithRetry(
  filename: string,
  buffer: Buffer,
  contentType: string,
  config = DEFAULT_RETRY_CONFIG
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const gcsFile = bucket.file(filename);

      await gcsFile.save(buffer, {
        metadata: { contentType },
        resumable: true, // 대용량 파일 자동 재개
      });

      const [signedUrl] = await gcsFile.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7일
      });

      console.log(`[GCS] 업로드 성공 (시도 ${attempt + 1}): ${filename}`);
      return signedUrl;

    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러 확인
      const isRetryable =
        error instanceof Error && (
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('429') ||
          error.message.includes('503')
        );

      if (!isRetryable) {
        throw error; // 재시도 불가능한 에러는 즉시 던짐
      }

      const delayMs = config.initialDelayMs *
        Math.pow(config.backoffFactor, attempt);

      console.warn(
        `[GCS] 업로드 실패 (시도 ${attempt + 1}/${config.maxAttempts}), ` +
        `${delayMs}ms 후 재시도: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );

      if (attempt < config.maxAttempts - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw new Error(
    `GCS 업로드 실패 (${config.maxAttempts}회 시도): ${lastError?.message || '알 수 없는 오류'}`
  );
}
```

##### 사용 예제

```typescript
// app/api/admin/upload-hero/route.ts
import { uploadWithRetry } from '@/lib/gcs-retry';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일 없음' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const filename = `hero/${Date.now()}-${file.name}`;

    const signedUrl = await uploadWithRetry(
      filename,
      Buffer.from(buffer),
      file.type,
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        backoffFactor: 2,
      }
    );

    return NextResponse.json({ success: true, url: signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '업로드 실패' },
      { status: 500 }
    );
  }
}
```

**재시도 타이밍**:
- 시도 1: 즉시
- 시도 2: 1초 후 (1000ms * 2^0)
- 시도 3: 2초 후 (1000ms * 2^1)
- 시도 4: 4초 후 (1000ms * 2^2)

---

### 2.4 환경 변수를 통한 인증 관리

#### 결정 (Decision)
GCS 인증은 환경 변수를 통해서만 관리하며, 로컬 개발/스테이징/프로덕션 환경별 별도 설정 파일을 사용합니다.

#### 근거 (Rationale)
- **보안**: GCS 서비스 계정 키를 코드베이스에 커밋 방지
- **환경 분리**: 프로덕션 버킷 vs 개발 버킷 자동 구분
- **배포 자동화**: GitHub Actions에서 암호화된 시크릿 사용 가능

#### 고려한 대안 (Alternatives Considered)
1. **환경 파일 직접 저장**: 보안 취약, 실수로 커밋 위험
2. **GCP Workload Identity**: Kubernetes 환경에서 권장, 현재 Next.js 호스팅에 과도
3. **API 키 대신 OAuth 2.0**: 사용자 인증 필요, 서버-서버 통신에는 맞지 않음

#### 구현 구조

```bash
# 프로젝트 구조
.env.local                          # 로컬 개발 (gitignore 필수)
.env.staging                        # 스테이징 (gitignore 필수)
.env.production                     # 프로덕션 (배포 시스템에서 주입)
.gcp/
  ├── service-account-dev.json      # 개발 환경 (gitignore 필수)
  ├── service-account-staging.json  # 스테이징 (gitignore 필수)
  └── service-account-prod.json     # 프로덕션 (배포 시스템에서 주입)
```

```bash
# .env.local (개발 환경)
NODE_ENV=development
GCP_PROJECT_ID=choi-pd-dev
GCS_BUCKET_NAME=choi-pd-images-dev
GCP_KEY_FILE_PATH=.gcp/service-account-dev.json

# .env.staging
NODE_ENV=staging
GCP_PROJECT_ID=choi-pd-staging
GCS_BUCKET_NAME=choi-pd-images-staging
GCP_KEY_FILE_PATH=.gcp/service-account-staging.json

# .env.production (환경 변수로 주입됨)
NODE_ENV=production
GCP_PROJECT_ID=choi-pd-prod
GCS_BUCKET_NAME=choi-pd-images-prod
GCP_KEY_FILE_PATH=/run/secrets/gcp_key
```

#### GCS 인증 유틸 함수

```typescript
// lib/gcs-auth.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';

let storageInstance: Storage | null = null;

export function getStorageInstance(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  const keyFilePath = process.env.GCP_KEY_FILE_PATH;
  const projectId = process.env.GCP_PROJECT_ID;

  if (!keyFilePath || !projectId) {
    throw new Error(
      'GCP_KEY_FILE_PATH와 GCP_PROJECT_ID 환경 변수가 필수입니다'
    );
  }

  // 절대 경로로 변환
  const absoluteKeyPath = keyFilePath.startsWith('/')
    ? keyFilePath
    : path.resolve(process.cwd(), keyFilePath);

  storageInstance = new Storage({
    projectId,
    keyFilename: absoluteKeyPath,
  });

  console.log(`[GCS] 인증 성공 (프로젝트: ${projectId})`);
  return storageInstance;
}

export function getBucket() {
  const storage = getStorageInstance();
  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME 환경 변수가 필수입니다');
  }

  return storage.bucket(bucketName);
}
```

#### 환경별 설정 검증

```typescript
// scripts/validate-env.ts
import fs from 'fs';
import path from 'path';

const requiredEnvVars = [
  'GCP_PROJECT_ID',
  'GCS_BUCKET_NAME',
  'GCP_KEY_FILE_PATH',
];

export function validateGCSConfig() {
  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `필수 환경 변수 누락: ${missingVars.join(', ')}`
    );
  }

  const keyPath = process.env.GCP_KEY_FILE_PATH!;
  const absolutePath = keyPath.startsWith('/')
    ? keyPath
    : path.resolve(process.cwd(), keyPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `GCP 서비스 계정 파일 없음: ${absolutePath}`
    );
  }

  try {
    const keyContent = JSON.parse(
      fs.readFileSync(absolutePath, 'utf-8')
    );

    if (!keyContent.private_key || !keyContent.client_email) {
      throw new Error('유효하지 않은 GCP 서비스 계정 형식');
    }

    console.log(`✓ GCS 설정 검증 완료 (프로젝트: ${process.env.GCP_PROJECT_ID})`);
  } catch (error) {
    throw new Error(
      `GCP 서비스 계정 파일 검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}
```

#### GitHub Actions에서 환경 변수 설정

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up environment
        run: |
          cat > .env.production << EOF
          NODE_ENV=production
          GCP_PROJECT_ID=${{ secrets.GCP_PROJECT_ID }}
          GCS_BUCKET_NAME=${{ secrets.GCS_BUCKET_NAME }}
          GCP_KEY_FILE_PATH=/run/secrets/gcp_key
          EOF

          mkdir -p /run/secrets
          echo "${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}" > /run/secrets/gcp_key
          chmod 600 /run/secrets/gcp_key
```

---

## 3. Drizzle ORM with SQLite

### 3.1 스키마 정의 베스트 프랙티스

#### 결정 (Decision)
Drizzle ORM을 사용하여 타입 안전한 SQLite 스키마를 정의하고, 모든 데이터베이스 작업은 API Routes를 통해서만 수행합니다.

#### 근거 (Rationale)
- **타입 안전**: TypeScript와 Drizzle ORM 통합으로 런타임 오류 방지
- **마이그레이션 관리**: 버전 관리 가능, 롤백 용이
- **쿼리 빌더**: SQL 직접 작성보다 안전하고 가독성 높음
- **성능**: 준비된 명령문(prepared statements)으로 SQL 인젝션 방지

#### 고려한 대안 (Alternatives Considered)
1. **Raw SQL**: 빠르지만 타입 안전 없음, 마이그레이션 관리 어려움
2. **Prisma**: Drizzle 대비 번들 크기 크고, SQLite 지원 제한적
3. **TypeORM**: 과도한 기능, 학습 곡선 높음

#### 구현 가이드

##### 3.1.1 설치 및 설정

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: 'file:./db/sqlite.db',
  },
});
```

##### 3.1.2 히어로 섹션 관련 스키마 정의

```typescript
// db/schema.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 히어로 섹션 배경 이미지 테이블
export const heroImages = sqliteTable('hero_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(), // 예: "2025년 메인 배경"
  imageUrl: text('image_url').notNull(), // GCS 서명된 URL
  gcsFilename: text('gcs_filename').notNull(), // GCS에서 관리할 파일명
  altText: text('alt_text').notNull(), // 접근성을 위한 대체 텍스트
  displayOrder: integer('display_order').default(0), // 우선순위
  isActive: integer('is_active').default(1), // 활성화 여부 (boolean)
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
});

// 서비스 카드 정보 테이블
export const serviceCards = sqliteTable('service_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(), // 예: "EDUCATION"
  description: text('description').notNull(),
  iconUrl: text('icon_url').notNull(), // 카드 아이콘 이미지 URL
  linkUrl: text('link_url').notNull(), // 클릭 시 이동 경로
  displayOrder: integer('display_order').default(0),
  isVisible: integer('is_visible').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
});

// 히어로 섹션 텍스트 콘텐츠 (다국어 지원 가능)
export const heroContent = sqliteTable('hero_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  language: text('language').default('ko'), // 'ko', 'en'
  mainTitle: text('main_title').notNull(), // 예: "최범희 PD의 세 가지 정체성"
  subtitle: text('subtitle').notNull(),
  description: text('description'),
  cta: text('cta').notNull(), // Call-to-action 버튼 텍스트
  ctaLink: text('cta_link').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
}, (table) => ({
  languageIndex: uniqueIndex('hero_content_language_idx')
    .on(table.language),
}));
```

**스키마 설계 원칙**:
1. **단수형 테이블명**: `hero_images` (O), `hero_image` (X)
2. **타입스크립트 스네이크케이스**: DB는 스네이크케이스, TS는 캐멜케이스
3. **타임스탬프**: `created_at`, `updated_at` 자동 기록
4. **부드러운 삭제 고려**: 향후 `deleted_at` 컬럼 추가 가능
5. **인덱스**: 자주 쿼리하는 컬럼에만 설정 (`language`, `is_active`)

---

### 3.2 마이그레이션 관리

#### 결정 (Decision)
Drizzle Kit의 생성 마이그레이션(generate migrations)을 사용하여 스키마 변경을 버전 관리하고, 각 배포 시 마이그레이션을 자동 실행합니다.

#### 근거 (Rationale)
- **버전 관리**: 스키마 변경 이력 추적, 협업 용이
- **롤백**: 이전 마이그레이션으로 쉽게 되돌리기 가능
- **프로덕션 안정성**: 마이그레이션 실행 실패 시 배포 자동 중단

#### 고려한 대안 (Alternatives Considered)
1. **수동 SQL 마이그레이션**: 오류 위험, 버전 관리 복잡
2. **마이그레이션 없이 스키마만 적용**: 기존 데이터 손실 위험

#### 마이그레이션 생성 및 실행

```bash
# 스키마 변경 후 마이그레이션 생성
npx drizzle-kit generate:sqlite --name add_hero_section

# 결과: db/migrations/0001_add_hero_section.sql 생성
```

```sql
-- db/migrations/0001_add_hero_section.sql
CREATE TABLE hero_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gcs_filename TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (current_timestamp),
  updated_at INTEGER DEFAULT (current_timestamp)
);

CREATE TABLE service_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (current_timestamp)
);

CREATE TABLE hero_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT DEFAULT 'ko',
  main_title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  cta TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  updated_at INTEGER DEFAULT (current_timestamp)
);

CREATE UNIQUE INDEX hero_content_language_idx ON hero_content(language);
```

#### 마이그레이션 실행 유틸

```typescript
// lib/db/migrate.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

export async function runMigrations() {
  const dbPath = process.env.DATABASE_URL || 'file:./db/sqlite.db';
  const cleanPath = dbPath.replace('file:', '');

  const sqlite = new Database(cleanPath);
  const db = drizzle(sqlite);

  const migrationsFolder = path.resolve(
    process.cwd(),
    'db/migrations'
  );

  try {
    console.log('마이그레이션 시작...');
    await migrate(db, {
      migrationsFolder,
    });
    console.log('마이그레이션 완료');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}
```

#### 배포 전 마이그레이션 실행 (Next.js)

```typescript
// lib/db/init.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { runMigrations } from './migrate';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function initializeDatabase() {
  if (dbInstance) return dbInstance;

  // 마이그레이션 실행
  await runMigrations();

  const dbPath = (process.env.DATABASE_URL || 'file:./db/sqlite.db')
    .replace('file:', '');

  const sqlite = new Database(dbPath);
  dbInstance = drizzle(sqlite);

  return dbInstance;
}

export async function getDatabase() {
  if (!dbInstance) {
    await initializeDatabase();
  }
  return dbInstance!;
}
```

```typescript
// app/api/hero/route.ts (마이그레이션 자동 실행)
import { getDatabase } from '@/lib/db/init';

export async function GET() {
  try {
    const db = await getDatabase(); // 마이그레이션 자동 실행
    const heroImages = await db.select().from(heroImages);

    return Response.json({ success: true, data: heroImages });
  } catch (error) {
    return Response.json(
      { error: '데이터 조회 실패' },
      { status: 500 }
    );
  }
}
```

---

### 3.3 타입 안전 쿼리 작성

#### 결정 (Decision)
모든 쿼리는 Drizzle ORM의 쿼리 빌더를 사용하여 타입 안전하게 작성하며, Raw SQL은 사용하지 않습니다.

#### 근거 (Rationale)
- **타입 검사**: 컴파일 시점에 쿼리 오류 감지
- **자동완성**: IDE에서 테이블/컬럼 자동완성
- **SQL 인젝션 방지**: 파라미터화된 쿼리 자동 생성

#### 고려한 대안 (Alternatives Considered)
1. **Raw SQL**: 유연하지만 타입 안전 없음, 인젝션 위험
2. **동적 쿼리 문자열**: 런타임 오류 위험, 디버깅 어려움

#### 구현 예제

```typescript
// lib/db/queries.ts
import { getDatabase } from '@/lib/db/init';
import {
  heroImages,
  serviceCards,
  heroContent
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 활성 히어로 배경 조회
export async function getActiveHeroImages() {
  const db = await getDatabase();

  return db
    .select()
    .from(heroImages)
    .where(eq(heroImages.isActive, 1))
    .orderBy((t) => t.displayOrder)
    .all();
}

// 특정 언어의 히어로 콘텐츠 조회
export async function getHeroContent(language: 'ko' | 'en' = 'ko') {
  const db = await getDatabase();

  return db
    .select()
    .from(heroContent)
    .where(eq(heroContent.language, language))
    .get();
}

// 서비스 카드 목록 (활성만)
export async function getVisibleServiceCards() {
  const db = await getDatabase();

  return db
    .select()
    .from(serviceCards)
    .where(eq(serviceCards.isVisible, 1))
    .orderBy((t) => t.displayOrder)
    .all();
}

// 히어로 이미지 추가
export async function createHeroImage(data: {
  title: string;
  imageUrl: string;
  gcsFilename: string;
  altText: string;
  displayOrder?: number;
}) {
  const db = await getDatabase();

  return db
    .insert(heroImages)
    .values({
      ...data,
      displayOrder: data.displayOrder ?? 0,
      isActive: 1,
    })
    .returning()
    .get();
}

// 히어로 콘텐츠 업데이트
export async function updateHeroContent(
  language: 'ko' | 'en',
  data: {
    mainTitle: string;
    subtitle: string;
    description?: string;
    cta: string;
    ctaLink: string;
  }
) {
  const db = await getDatabase();

  return db
    .update(heroContent)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(heroContent.language, language))
    .returning()
    .get();
}

// 트랜잭션 예제: 여러 테이블 동시 업데이트
export async function updateHeroSection(
  heroImageId: number,
  contentUpdates: { mainTitle: string; subtitle: string }
) {
  const db = await getDatabase();

  return db.transaction(async (tx) => {
    // 이미지 활성화
    await tx
      .update(heroImages)
      .set({ isActive: 1 })
      .where(eq(heroImages.id, heroImageId));

    // 콘텐츠 업데이트
    const updatedContent = await tx
      .update(heroContent)
      .set({ ...contentUpdates, updatedAt: new Date() })
      .where(eq(heroContent.language, 'ko'))
      .returning()
      .get();

    return updatedContent;
  });
}
```

#### API Route에서 사용

```typescript
// app/api/admin/hero/update/route.ts
import { updateHeroContent } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, mainTitle, subtitle, description, cta, ctaLink } = body;

    // 타입 검증
    if (!['ko', 'en'].includes(language)) {
      return NextResponse.json(
        { error: '유효하지 않은 언어' },
        { status: 400 }
      );
    }

    const result = await updateHeroContent(language, {
      mainTitle,
      subtitle,
      description,
      cta,
      ctaLink,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '업데이트 실패' },
      { status: 500 }
    );
  }
}
```

---

## 4. 접근성 (WCAG 2.1 AA)

### 4.1 키보드 네비게이션 구현

#### 결정 (Decision)
히어로 섹션 모든 대화형 요소(버튼, 링크)는 Tab 키로 순차 이동 가능하며, 포커스 스타일은 명확하게 표시됩니다.

#### 근거 (Rationale)
- **WCAG 2.1 AA 기준 2.1.1**: 키보드 접근성은 필수 요구사항
- **사용자 포용성**: 마우스 사용 불가 사용자(장애인, 시니어) 지원
- **SEO 추가 효과**: Google은 접근성 좋은 사이트를 높게 평가

#### 고려한 대안 (Alternatives Considered)
1. **마우스 전용**: 접근성 기준 미충족, 사용자 범위 제한
2. **자동 포커스 관리**: 수동 제어보다 신뢰도 낮음

#### 구현 예제

```typescript
// components/HeroSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC 키로 모달 닫기 등 추가 단축키 구현 가능
    if (e.key === 'Escape') {
      // 모달 닫기 로직
    }
  };

  return (
    <section
      className="relative w-full h-screen flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 콘텐츠 */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          최범희 PD의 세 가지 정체성
        </h1>

        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          스마트폰 창업 전략가, 저자, 미디어 발행인
        </p>

        {/* CTA 버튼 - 포커스 가능 */}
        <Button
          asChild
          size="lg"
          className="focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
          tabIndex={0}
        >
          <Link href="/education">
            더 알아보기
          </Link>
        </Button>

        {/* Skip Link (보조 기술 사용자용) */}
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-black focus:text-white focus:p-2 focus:rounded"
        >
          메인 콘텐츠로 이동
        </Link>
      </div>

      {/* 서비스 카드 네비게이션 */}
      <nav
        className="absolute bottom-8 left-0 right-0 flex gap-4 justify-center px-4"
        aria-label="서비스 목록"
      >
        {['EDUCATION', 'MEDIA', 'WORKS'].map((service, index) => (
          <Link
            key={service}
            href={`/${service.toLowerCase()}`}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            tabIndex={0}
            title={`${service} 섹션으로 이동`}
          >
            {service}
          </Link>
        ))}
      </nav>
    </section>
  );
}
```

**포커스 스타일 Tailwind 유틸**:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // 포커스 스타일 일관성 확보
      outline: {
        focus: '2px solid rgb(96, 165, 250)',
        focusOffset: '2px',
      },
    },
  },
};

// 재사용 가능한 포커스 클래스
const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2';
```

**Skip Link 패턴**:
- `sr-only`: 화면 리더 사용자만 볼 수 있도록 숨김
- `focus:not-sr-only`: 포커스 시 표시
- 목적: 긴 네비게이션 스킵하여 메인 콘텐츠로 빠르게 이동

---

### 4.2 ARIA 레이블 사용

#### 결정 (Decision)
모든 아이콘 버튼, 이미지, 랜드마크는 ARIA 속성으로 레이블을 제공합니다.

#### 근거 (Rationale)
- **화면 리더 호환성**: 스크린 리더 사용자가 컨텐츠 의미 파악 가능
- **의미적 마크업**: HTML 구조와 ARIA 속성이 일관성 있음
- **WCAG 2.1 AA 레벨 달성**: 필수 접근성 기준

#### 고려한 대안 (Alternatives Considered)
1. **alt 속성만 사용**: 이미지에는 충분하지만 대화형 요소는 불충분
2. **화면상 레이블**: 시각 장애인도 버튼 목적 이해 가능하도록 해야 함

#### 구현 예제

```typescript
// components/HeroServiceCard.tsx
import Image from 'next/image';

interface ServiceCardProps {
  title: 'EDUCATION' | 'MEDIA' | 'WORKS';
  description: string;
  icon: string;
  href: string;
}

export function HeroServiceCard({
  title,
  description,
  icon,
  href,
}: ServiceCardProps) {
  return (
    <a
      href={href}
      className="group block p-6 rounded-lg bg-white/10 hover:bg-white/20 transition"
      // ARIA 레이블로 카드 목적 명시
      aria-label={`${title} 서비스: ${description}`}
      role="link"
    >
      {/* 아이콘 이미지 - alt 텍스트 필수 */}
      <Image
        src={icon}
        alt={`${title} 아이콘`}
        width={48}
        height={48}
        className="mb-4"
      />

      {/* 제목 */}
      <h3 className="text-xl font-bold mb-2" id={`service-${title}`}>
        {title}
      </h3>

      {/* 설명 */}
      <p className="text-sm text-gray-300">{description}</p>
    </a>
  );
}
```

**ARIA 속성 체크리스트**:

```typescript
// 1. aria-label: 시각적 레이블 없는 아이콘 버튼
<button aria-label="메뉴 열기">
  <MenuIcon />
</button>

// 2. aria-labelledby: 텍스트 레이블 존재 시
<h2 id="hero-title">최범희 PD의 정체성</h2>
<section aria-labelledby="hero-title">...</section>

// 3. aria-describedby: 추가 설명
<button
  aria-label="더 알아보기"
  aria-describedby="cta-description"
>
  더 알아보기
</button>
<span id="cta-description" className="sr-only">
  교육 과정 상세 페이지로 이동합니다
</span>

// 4. aria-hidden: 장식 요소 무시
<div aria-hidden="true" className="decorative-bg" />

// 5. role: 의미적 역할 명시 (시맨틱 HTML 우선)
<div role="navigation" aria-label="주요 서비스">
  {/* 또는 <nav aria-label="주요 서비스"> 권장 */}
</div>
```

---

### 4.3 명암비 4.5:1 확보 방법

#### 결정 (Decision)
모든 텍스트와 배경의 명암비는 최소 4.5:1 (일반 텍스트) 또는 3:1 (큰 텍스트)을 충족합니다.

#### 근거 (Rationale)
- **시각 장애인 지원**: 약 260만 명(한국)의 저시력 사용자 지원
- **SEO**: Google은 접근성 좋은 사이트를 높게 평가
- **가독성**: 모든 사용자의 읽기 효율 증가

#### 고려한 대안 (Alternatives Considered)
1. **낮은 명암비 선택**: 시각적 미학을 위해 접근성 포기 → 사용자 배제
2. **컨트라스트 높은 테마만**: 사용자 선호도 무시

#### 명암비 계산 및 검증

```typescript
// lib/a11y/contrast.ts
/**
 * WCAG 명암비 계산
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928
      ? c / 12.92
      : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG_AA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
```

**히어로 섹션 색상 예제**:

```typescript
// components/HeroSection.tsx
import { getContrastRatio, meetsWCAG_AA } from '@/lib/a11y/contrast';

// 배경: 검은색 (0, 0, 0), 텍스트: 흰색 (255, 255, 255)
const ratio = getContrastRatio([0, 0, 0], [255, 255, 255]);
console.log(`명암비: ${ratio.toFixed(2)}:1`); // 21:1 ✓

// 검증
const isAccessible = meetsWCAG_AA(ratio);
console.log(`WCAG AA 충족: ${isAccessible}`); // true

// 실제 구현
export function HeroSection() {
  return (
    <section
      className="relative bg-black"
      style={{
        // 배경: 어두운 회색 (#1a1a1a)
        backgroundColor: '#1a1a1a',
      }}
    >
      {/* 배경 오버레이 - 명암비 확보용 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 텍스트: 흰색 (#ffffff)
          명암비: 약 15:1 ✓ */}
      <div className="relative z-10 text-white">
        <h1 className="text-4xl md:text-5xl font-bold">
          최범희 PD의 세 가지 정체성
        </h1>

        <p className="text-lg mt-4">
          스마트폰 창업 전략가, 저자, 미디어 발행인
        </p>

        {/* 버튼: 파란색 배경 (#3b82f6), 흰색 텍스트
            명암비: 약 6.7:1 ✓ */}
        <button className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          더 알아보기
        </button>
      </div>
    </section>
  );
}
```

**명암비 검증 도구**:
- WAVE: https://wave.webaim.org
- Axe DevTools: Chrome/Firefox 확장
- Color Contrast Analyzer: https://www.tpgi.com/color-contrast-checker
- Tailwind Contrast: https://www.tailwindshades.com

**Tailwind CSS 명암비 좋은 조합**:

```typescript
// ✓ 강추 조합
const contrastCombos = {
  '흰색 텍스트': {
    'bg-gray-900': '20.1:1', // 명암비 매우 높음
    'bg-gray-800': '18.5:1',
    'bg-blue-900': '11.2:1',
    'bg-blue-800': '7.8:1', // 최소 AA
  },
  '검은색 텍스트': {
    'bg-gray-100': '19.1:1', // 명암비 매우 높음
    'bg-blue-100': '9.2:1',
    'bg-yellow-100': '2.3:1', // ✗ WCAG AA 미충족
  },
};
```

---

## 5. 모바일 우선 반응형 디자인

### 5.1 Tailwind CSS 브레이크포인트 전략

#### 결정 (Decision)
모바일 우선(mobile-first) 접근법을 사용하여 기본 스타일은 모바일 대상으로, 브레이크포인트에서 점진적으로 향상합니다.

#### 근거 (Rationale)
- **성능**: 모바일 먼저 최적화하면 데스크톱도 자동으로 빠름
- **사용자 분포**: 전 세계 트래픽 50-70%가 모바일
- **Tailwind 설계**: 기본적으로 모바일 우선 지원

#### 고려한 대안 (Alternatives Considered)
1. **데스크톱 우선**: 모바일 성능 저하, CSS 복잡도 증가
2. **절대 픽셀 지정**: 반응형 미지원, 유지보수 어려움

#### 브레이크포인트 전략

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // 소형 모바일
      'md': '768px',   // 태블릿
      'lg': '1024px',  // 소형 데스크톱
      'xl': '1280px',  // 일반 데스크톱
      '2xl': '1536px', // 대형 데스크톱
    },
  },
};

// 히어로 섹션 구현
export function HeroSection() {
  return (
    <section className="relative w-full">
      {/* 높이: 모바일 100vh, 데스크톱 120vh */}
      <div className="h-screen md:h-[120vh] flex items-center justify-center">
        {/* 배경 이미지 */}
        <Image
          src="/hero-bg.jpg"
          alt="히어로 배경"
          fill
          className="object-cover object-center"
        />

        {/* 콘텐츠: 모바일은 위아래 패딩, 데스크톱은 여백 */}
        <div className="relative z-10 text-center text-white px-4 md:px-8">
          {/* 제목: 모바일 2.5rem, 데스크톱 4rem */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            최범희 PD의 세 가지 정체성
          </h1>

          {/* 부제목 */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 max-w-2xl">
            스마트폰 창업 전략가, 저자, 미디어 발행인
          </p>

          {/* CTA 버튼: 모바일은 전체 너비, 데스크톱은 자동 */}
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/education">더 알아보기</Link>
          </Button>
        </div>
      </div>

      {/* 서비스 카드: 모바일 1열, 데스크톱 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-4 md:px-8 -mt-20 relative z-20 max-w-6xl mx-auto">
        {['EDUCATION', 'MEDIA', 'WORKS'].map(service => (
          <ServiceCard key={service} title={service} />
        ))}
      </div>
    </section>
  );
}
```

**브레이크포인트 사용 패턴**:

```typescript
// 패턴 1: 기본값 + md/lg 수정자
<h1 className="text-2xl md:text-4xl lg:text-5xl">...</h1>

// 패턴 2: 레이아웃 전환
<div className="block md:hidden">모바일 메뉴</div>
<div className="hidden md:block">데스크톱 메뉴</div>

// 패턴 3: 그리드 레이아웃
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>

// 패턴 4: 여백 조정
<div className="px-4 md:px-8 lg:px-16">
  {/* 모바일: 16px 패딩, 데스크톱: 64px */}
</div>
```

---

### 5.2 터치 타겟 44x44px 확보

#### 결정 (Decision)
모든 대화형 요소(버튼, 링크, 입력 필드)는 최소 44x44px (권장: 48x48px) 크기를 확보합니다.

#### 근거 (Rationale)
- **WCAG 2.1 AAA 기준**: 터치 타겟 최소 44x44px
- **모바일 사용성**: 손가락으로 정확하게 탭 가능한 크기
- **오류 감소**: 잘못된 버튼 클릭 방지

#### 고려한 대안 (Alternatives Considered)
1. **32x32px 버튼**: 작은 버튼은 오류율 높음 (특히 50대 이상)
2. **가변 크기**: 일관성 부족, 구현 복잡

#### 구현 가이드

```typescript
// components/HeroButton.tsx
import { cn } from '@/lib/utils';

interface HeroButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
}

export function HeroButton({
  children,
  href,
  variant = 'primary',
}: HeroButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        // 기본: 48x48px 최소 크기 확보
        'inline-flex items-center justify-center',
        'h-12 px-6', // height 48px (h-12), 좌우 패딩
        'min-w-[44px]', // 최소 너비 44px
        'rounded-lg',
        'font-semibold',
        'transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // 터치 대상으로 추가 패딩
        'active:scale-95', // 모바일 피드백
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
        variant === 'secondary' && 'bg-white/20 text-white hover:bg-white/30 focus:ring-blue-400',
      )}
    >
      {children}
    </a>
  );
}

// 서비스 카드: 터치 타겟 최소 44px
export function ServiceCard() {
  return (
    <a
      href="/education"
      className={cn(
        // 최소 높이 44px (h-11) + 패딩으로 자연스러운 크기
        'block p-6', // padding 24px (p-6) = 44px + 4px 여유
        'rounded-lg',
        'hover:bg-white/20',
        'focus:outline-none focus:ring-2 focus:ring-blue-400',
        'transition-colors',
      )}
    >
      <h3>서비스 제목</h3>
      <p>설명</p>
    </a>
  );
}

// 매우 작은 버튼의 경우: 터치 영역 확대 (hit area)
export function SmallIconButton() {
  return (
    <button
      className={cn(
        // 아이콘: 24x24px
        'relative',
        // 터치 영역: 44x44px (최소)
        'after:absolute after:inset-0 after:-m-2',
        'after:pointer-events-none',
        // 시각적으로는 작게, 터치 영역은 크게
        'p-1', // 4px 패딩
        'w-6 h-6', // 24x24px
      )}
    >
      <svg /* 아이콘 */></svg>
    </button>
  );
}
```

**Tailwind 크기 참조**:

```typescript
// h-10 = 40px (경계선)
// h-11 = 44px (최소 권장)
// h-12 = 48px (권장)
// h-14 = 56px (최적)

const sizeGuidelines = {
  'h-8': '32px - 너무 작음 ✗',
  'h-10': '40px - 경계선 ⚠️',
  'h-11': '44px - 최소 권장 ✓',
  'h-12': '48px - 권장 ✓✓',
  'h-14': '56px - 최적 (시니어 사용자) ✓✓✓',
};
```

---

### 5.3 모바일 성능 최적화

#### 결정 (Decision)
히어로 섹션 모바일 성능 목표: Lighthouse 성능 점수 90 이상, LCP 2.5초 이내, CLS < 0.1.

#### 근거 (Rationale)
- **사용자 만족도**: 빠른 로딩은 방문 지속률 증가, 이탈률 감소
- **SEO**: Core Web Vitals은 Google 검색 순위 직접 영향
- **비용**: 느린 페이지는 모바일 데이터 사용량 증가 → 사용자 만족도 저하

#### 고려한 대안 (Alternatives Considered)
1. **성능 무시**: 사용자 이탈 증가, SEO 순위 하락
2. **과도한 최적화**: 유지보수 복잡도 증가, ROI 감소

#### 모바일 성능 최적화 체크리스트

```typescript
// 1. 이미지 최적화
- [ ] 히어로 배경: 모바일 1000px 이하, 데스크톱 2000px
- [ ] 포맷: WebP (Next.js 자동 변환)
- [ ] quality 설정: 75-85
- [ ] lazy loading: 비LCP 이미지만

// 2. 폰트 최적화
- [ ] system font 우선 사용 또는 next/font로 최적화
- [ ] font-display: swap (텍스트 먼저, 폰트 로드 후 교체)
- [ ] 불필요한 weight/style 제외

// 3. CSS 최적화
- [ ] Tailwind 사용 (자동 tree-shaking)
- [ ] 사용하지 않는 클래스 제거
- [ ] CSS 파일 크기: < 50KB

// 4. 자바스크립트 최적화
- [ ] 번들 크기: < 50KB (히어로 섹션 관련)
- [ ] 코드 분할: 레이아웃당 200KB 이하
- [ ] 동기 스크립트 최소화

// 5. 네트워크 최적화
- [ ] HTTP/2 활용
- [ ] Gzip 압축 활성화
- [ ] CDN 사용 (Next.js 호스팅 자동)

// 6. 캐싱 전략
- [ ] 정적 자산: max-age=31536000 (1년)
- [ ] HTML: max-age=3600 (1시간)
- [ ] ISR: revalidate=3600
```

#### 성능 측정 및 모니터링

```typescript
// lib/performance.ts
export function reportWebVitals(metric: any) {
  // Google Analytics에 전송
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      metric_name: metric.name,
      value: Math.round(metric.value),
      metric_delta: metric.delta,
      metric_id: metric.id,
    });
  }

  // 콘솔 로깅 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}:`, Math.round(metric.value));
  }
}

// next.config.ts에서 호출
import { reportWebVitals } from './lib/performance';
export { reportWebVitals };
```

**Core Web Vitals 타겟값**:

```typescript
const targetMetrics = {
  'LCP (Largest Contentful Paint)': {
    good: '2.5초 이하',
    needsImprovement: '2.5-4초',
    poor: '4초 이상',
  },
  'FID (First Input Delay)': {
    good: '100ms 이하',
    needsImprovement: '100-300ms',
    poor: '300ms 이상',
  },
  'CLS (Cumulative Layout Shift)': {
    good: '0.1 이하',
    needsImprovement: '0.1-0.25',
    poor: '0.25 이상',
  },
};
```

**모바일 테스트 도구**:
- PageSpeed Insights: https://pagespeed.web.dev
- Lighthouse (Chrome DevTools)
- WebPageTest: https://www.webpagetest.org
- Throttling 설정: Fast 3G 또는 4G

---

## 6. 종합 구현 체크리스트

### Hero Section Phase 0 완료 기준

```markdown
## 이미지 최적화
- [ ] Next.js Image 컴포넌트 도입
- [ ] priority 설정으로 LCP 최적화
- [ ] 반응형 이미지 (sizes 속성)
- [ ] WebP 자동 변환 확인

## Google Cloud Storage
- [ ] GCS SDK 설치 및 인증 설정
- [ ] 업로드 API Route 구현
- [ ] 서명된 URL 생성 기능
- [ ] 재시도 로직 구현
- [ ] 환경 변수 분리 (.env 파일)

## 데이터베이스
- [ ] Drizzle ORM 설치
- [ ] 히어로 관련 테이블 스키마 정의
- [ ] 마이그레이션 파일 생성
- [ ] 타입 안전 쿼리 함수 작성

## 접근성 (WCAG 2.1 AA)
- [ ] 키보드 네비게이션 (Tab, Enter)
- [ ] 포커스 스타일 명확함
- [ ] ARIA 레이블 추가
- [ ] 명암비 4.5:1 이상 확보
- [ ] Skip Link 구현

## 반응형 디자인
- [ ] 모바일 우선 구현
- [ ] 브레이크포인트 적용 (sm, md, lg)
- [ ] 터치 타겟 44x44px 이상
- [ ] 모바일 성능 최적화

## 성능 측정
- [ ] Lighthouse 90 이상 (모바일)
- [ ] LCP < 2.5초
- [ ] CLS < 0.1
- [ ] Core Web Vitals 모니터링 설정
```

---

## 참고 자료

### 공식 문서
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Google Cloud Storage Node.js](https://cloud.google.com/nodejs/docs/reference/storage/latest)
- [Drizzle ORM SQLite](https://orm.drizzle.team/docs/sql-indexes)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)

### 도구 및 서비스
- **성능 측정**: PageSpeed Insights, Lighthouse, WebPageTest
- **접근성 검증**: WAVE, Axe DevTools, TPGI Contrast Analyzer
- **색상 대비**: Tailwind Shades, Color Contrast Checker

### 핵심 용어
- **LCP**: 페이지의 가장 큰 콘텐츠 요소가 화면에 표시되는 시간
- **CLS**: 예기치 않은 레이아웃 변화 정도
- **WCAG**: 웹 접근성 지침 (Web Content Accessibility Guidelines)
- **ISR**: Next.js의 증분 정적 재생성 (Incremental Static Regeneration)

---

**문서 작성**: 2025년 11월 18일
**상태**: Phase 0 연구 완료
**다음 단계**: Phase 1 상세 설계 문서 작성
