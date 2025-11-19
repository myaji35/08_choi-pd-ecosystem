# 성능 최적화 가이드 (Performance Optimization Guide)

이 문서는 최범희 PD 통합 브랜드 허브의 성능 목표 및 최적화 전략을 설명합니다.

## 성능 목표

이 프로젝트는 다음과 같은 **Lighthouse 성능 점수 목표**를 설정합니다:

- **Performance**: 70점 이상
- **Accessibility**: 90점 이상
- **Best Practices**: 80점 이상
- **SEO**: 80점 이상

## Lighthouse 테스트 실행

### 자동화 테스트
```bash
# 개발 서버를 먼저 실행
npm run dev

# 다른 터미널에서 Lighthouse 테스트 실행
npm run test:lighthouse
```

### 브라우저 DevTools
1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. "Generate report" 클릭
4. 성능, 접근성, 권장사항, SEO 점수 확인

## 핵심 성능 지표 (Core Web Vitals)

### 1. LCP (Largest Contentful Paint) - 목표: 2.5초 이하
가장 큰 콘텐츠 요소가 화면에 렌더링되는 시간

**최적화 방법:**
- 히어로 이미지 최적화 (WebP 형식, 압축)
- Next.js Image 컴포넌트 사용
- ISR (Incremental Static Regeneration) 활용
- CDN을 통한 이미지 제공 (GCS)

### 2. FID (First Input Delay) - 목표: 100ms 이하
사용자 입력에 대한 응답 시간

**최적화 방법:**
- JavaScript 번들 크기 최소화
- Code splitting 적용
- 중요하지 않은 스크립트는 지연 로딩

### 3. CLS (Cumulative Layout Shift) - 목표: 0.1 이하
페이지 로드 중 레이아웃 변경 정도

**최적화 방법:**
- 이미지에 명시적 width/height 지정
- 폰트 로딩 최적화 (font-display: swap)
- 광고/배너 영역에 고정 크기 지정

## 구현된 성능 최적화

### 1. **이미지 최적화**
```typescript
// Sharp를 이용한 이미지 처리
- 16:9 비율로 자동 크롭
- 1920x1080 권장 해상도
- GCS에 최적화된 이미지 업로드
```

### 2. **ISR (Incremental Static Regeneration)**
```typescript
// src/app/page.tsx
export const revalidate = 3600; // 1시간마다 재생성
```
- 정적 페이지 생성으로 빠른 로딩
- 주기적으로 콘텐츠 업데이트

### 3. **Code Splitting**
- Next.js 16 App Router 자동 code splitting
- Dynamic imports for non-critical components

### 4. **GCS CDN**
- Google Cloud Storage를 통한 이미지 제공
- 전 세계 CDN으로 빠른 이미지 로딩
- Cache-Control 헤더 설정 (1년)

### 5. **Tailwind CSS 최적화**
- Production 빌드 시 사용하지 않는 CSS 제거
- JIT (Just-In-Time) 컴파일러 사용

## 성능 체크리스트

### 이미지
- [ ] WebP 형식 사용 (또는 JPEG 최적화)
- [ ] 적절한 이미지 크기 (1920x1080 for hero)
- [ ] lazy loading 적용
- [ ] width/height 명시

### JavaScript
- [ ] 번들 크기 최소화 (< 200KB gzipped)
- [ ] Tree shaking 적용
- [ ] Critical JS만 동기 로딩
- [ ] 나머지는 지연/비동기 로딩

### CSS
- [ ] Critical CSS 인라인
- [ ] Unused CSS 제거
- [ ] CSS 파일 압축

### 캐싱
- [ ] 정적 자산 캐싱 (이미지, CSS, JS)
- [ ] ISR로 HTML 캐싱
- [ ] GCS에 Cache-Control 헤더 설정

### 폰트
- [ ] 시스템 폰트 우선 사용
- [ ] 웹폰트는 font-display: swap
- [ ] 폰트 서브셋 로딩

## 성능 모니터링

### 개발 중
```bash
# Build 분석
npm run build

# Lighthouse 테스트
npm run test:lighthouse
```

### 프로덕션
- Google Analytics Core Web Vitals 리포트
- Vercel/Cloudflare Analytics (배포 시)
- Real User Monitoring (RUM)

## 일반적인 성능 문제 해결

### 문제: 느린 이미지 로딩
```tsx
// ❌ 최적화되지 않은 예
<img src="/large-image.jpg" />

// ✅ 최적화된 예
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  priority // Above-the-fold 이미지
/>
```

### 문제: 큰 JavaScript 번들
```tsx
// ❌ 전체 라이브러리 import
import _ from 'lodash';

// ✅ 필요한 함수만 import
import debounce from 'lodash/debounce';
```

### 문제: 렌더 블로킹 CSS
```tsx
// ✅ Critical CSS는 인라인, 나머지는 비동기
<link rel="preload" href="/styles.css" as="style" />
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'" />
```

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
