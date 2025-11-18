# 데이터 모델: 히어로 섹션

**날짜**: 2025-11-18
**기능**: 001-hero-section
**참조**: [spec.md](./spec.md), [research.md](./research.md)

---

## 개요

히어로 섹션 기능은 두 가지 주요 엔티티로 구성됩니다:
1. **HeroImage**: 관리자가 업로드하고 관리하는 히어로 이미지 메타데이터
2. **ServiceCard**: 세 가지 서비스 영역(Education, Media, Works)으로 연결되는 네비게이션 카드 (정적 데이터)

---

## 엔티티 정의

### 1. HeroImage

히어로 섹션의 배경 이미지 또는 브랜드 사진을 나타내는 엔티티입니다.

#### 필드

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | integer | PRIMARY KEY, AUTO_INCREMENT | 고유 식별자 |
| `filename` | text | NOT NULL | 저장된 파일명 (예: `hero-1731898000000.jpg`) |
| `url` | text | NOT NULL | 이미지 URL 경로 (예: `/uploads/hero/hero-1731898000000.jpg`) |
| `altText` | text | NOT NULL | 접근성을 위한 대체 텍스트 |
| `fileSize` | integer | NOT NULL | 파일 크기 (bytes) |
| `width` | integer | NULLABLE | 이미지 너비 (pixels) |
| `height` | integer | NULLABLE | 이미지 높이 (pixels) |
| `uploadedAt` | integer | NOT NULL | 업로드 타임스탬프 (Unix timestamp) |
| `isActive` | integer (boolean) | DEFAULT false | 현재 활성화된 히어로 이미지 여부 |

#### 비즈니스 규칙

1. **단일 활성 이미지**: 한 번에 하나의 이미지만 `isActive = true` 상태를 가질 수 있습니다.
2. **파일 크기 제한**: `fileSize`는 2MB (2,097,152 bytes) 이하여야 합니다 (FR-009).
3. **파일 타입 검증**: `filename` 확장자는 `.jpg`, `.jpeg`, `.png`, `.webp` 중 하나여야 합니다.
4. **자동 비활성화**: 새 이미지가 업로드되고 활성화되면, 기존 활성 이미지는 자동으로 `isActive = false`로 변경됩니다.

#### 상태 전환

```
[업로드 대기] --업로드 성공--> [저장됨, isActive=false]
[저장됨, isActive=false] --활성화--> [저장됨, isActive=true]
[저장됨, isActive=true] --새 이미지 활성화--> [저장됨, isActive=false]
[저장됨] --관리자 삭제--> [파일 시스템에서 제거]
```

#### Drizzle ORM 스키마

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const heroImages = sqliteTable('hero_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false).notNull(),
});

export type HeroImage = typeof heroImages.$inferSelect;
export type NewHeroImage = typeof heroImages.$inferInsert;
```

#### 샘플 데이터

```json
{
  "id": 1,
  "filename": "hero-1731898000000.jpg",
  "url": "/uploads/hero/hero-1731898000000.jpg",
  "altText": "최범희 PD의 교육, 미디어, 작품 활동을 상징하는 이미지",
  "fileSize": 1048576,
  "width": 1920,
  "height": 1080,
  "uploadedAt": 1731898000,
  "isActive": true
}
```

---

### 2. ServiceCard (정적 데이터)

세 가지 서비스 영역으로 연결되는 네비게이션 카드를 나타냅니다. 이 데이터는 데이터베이스에 저장되지 않고 코드 내에 정적으로 정의됩니다.

#### 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `id` | string | 고유 식별자 (예: `"education"`) |
| `title` | string | 카드 제목 (예: `"교육"`) |
| `description` | string | 간략한 설명 (예: `"스마트폰 창업 전략가"`) |
| `href` | string | 링크 경로 (예: `"/education"`) |
| `icon` | string (선택) | 아이콘 이름 (Lucide React 아이콘) |
| `color` | string | Tailwind 색상 클래스 (예: `"bg-blue-600"`) |

#### 정적 정의 (TypeScript)

```typescript
// app/(home)/_components/serviceCardsData.ts
export const serviceCards = [
  {
    id: 'education',
    title: '교육',
    description: '스마트폰 창업 전략가',
    href: '/education',
    icon: 'GraduationCap', // Lucide React 아이콘
    color: 'bg-blue-600',
  },
  {
    id: 'media',
    title: '미디어',
    description: '한국환경저널 발행인',
    href: '/media',
    icon: 'Newspaper',
    color: 'bg-green-600',
  },
  {
    id: 'works',
    title: '작품',
    description: '작가 & 모바일 스케치 아티스트',
    href: '/works',
    icon: 'Palette',
    color: 'bg-purple-600',
  },
] as const;

export type ServiceCard = (typeof serviceCards)[number];
```

#### 비즈니스 규칙

1. **고정된 3개 카드**: Education, Media, Works 순서로 항상 3개의 카드만 표시됩니다.
2. **링크 유효성**: 각 `href`는 실제 존재하는 페이지 경로여야 합니다.
3. **접근성**: 각 카드는 최소 44x44px 터치 타겟을 보장해야 합니다 (FR-006, User Story 2).

---

## 엔티티 관계도 (ERD)

```
┌─────────────────────────────────────┐
│         HeroImage                   │
├─────────────────────────────────────┤
│ id: integer (PK)                    │
│ filename: text                      │
│ url: text                           │
│ altText: text                       │
│ fileSize: integer                   │
│ width: integer                      │
│ height: integer                     │
│ uploadedAt: timestamp               │
│ isActive: boolean                   │
└─────────────────────────────────────┘
        │
        │ 1 active image
        ▼
┌─────────────────────────────────────┐
│      HomePage (렌더링)              │
│  - 활성 HeroImage 1개 표시          │
│  - ServiceCards 3개 정적 렌더링     │
└─────────────────────────────────────┘
```

**관계 설명**:
- `HeroImage`는 독립 엔티티이며, 다른 엔티티와 외래키 관계를 맺지 않습니다.
- 홈페이지는 `isActive = true`인 HeroImage 1개를 조회하여 표시합니다.
- `ServiceCard`는 데이터베이스 엔티티가 아니므로 관계도에 포함되지 않습니다.

---

## 데이터베이스 쿼리 패턴

### 1. 활성 히어로 이미지 조회

**사용 사례**: 홈페이지 렌더링 시 현재 활성화된 히어로 이미지를 가져옵니다.

```typescript
// lib/db/queries/heroImage.ts
import { db } from '@/lib/db';
import { heroImages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getActiveHeroImage() {
  const [activeImage] = await db
    .select()
    .from(heroImages)
    .where(eq(heroImages.isActive, true))
    .limit(1);

  return activeImage ?? null;
}
```

---

### 2. 새 히어로 이미지 업로드 및 활성화

**사용 사례**: 관리자가 새 이미지를 업로드하면, 기존 활성 이미지를 비활성화하고 새 이미지를 활성화합니다.

```typescript
// lib/db/queries/heroImage.ts
import { db } from '@/lib/db';
import { heroImages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function uploadAndActivateHeroImage(imageData: NewHeroImage) {
  return await db.transaction(async (tx) => {
    // 1. 기존 활성 이미지 비활성화
    await tx
      .update(heroImages)
      .set({ isActive: false })
      .where(eq(heroImages.isActive, true));

    // 2. 새 이미지 삽입 및 활성화
    const [newImage] = await tx
      .insert(heroImages)
      .values({ ...imageData, isActive: true })
      .returning();

    return newImage;
  });
}
```

---

### 3. 모든 히어로 이미지 목록 조회 (관리자용)

**사용 사례**: 관리자 페이지에서 업로드된 모든 이미지 목록을 표시합니다.

```typescript
// lib/db/queries/heroImage.ts
export async function getAllHeroImages() {
  return await db
    .select()
    .from(heroImages)
    .orderBy(heroImages.uploadedAt, 'desc'); // 최신순 정렬
}
```

---

### 4. 히어로 이미지 삭제

**사용 사례**: 관리자가 이미지를 삭제하면, 데이터베이스 레코드와 파일 시스템에서 파일을 제거합니다.

```typescript
// lib/db/queries/heroImage.ts
import { unlink } from 'fs/promises';
import path from 'path';

export async function deleteHeroImage(imageId: number) {
  const [image] = await db
    .select()
    .from(heroImages)
    .where(eq(heroImages.id, imageId))
    .limit(1);

  if (!image) {
    throw new Error('이미지를 찾을 수 없습니다.');
  }

  // 활성 이미지 삭제 방지
  if (image.isActive) {
    throw new Error('활성 이미지는 삭제할 수 없습니다.');
  }

  // 1. DB에서 레코드 삭제
  await db.delete(heroImages).where(eq(heroImages.id, imageId));

  // 2. 파일 시스템에서 파일 삭제
  const filepath = path.join(process.cwd(), 'public', image.url);
  await unlink(filepath);

  return { success: true };
}
```

---

## 유효성 검증 규칙

### HeroImage 업로드 시 검증

**서버 사이드 검증 (API Route)**:

```typescript
// lib/utils/validation.ts
import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const heroImageUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    if (!ALLOWED_TYPES.includes(file.type)) return false;
    if (file.size > MAX_FILE_SIZE) return false;
    return true;
  }, {
    message: '유효하지 않은 파일입니다. JPG, PNG, WebP 형식이어야 하며, 크기는 2MB 이하여야 합니다.',
  }),
  altText: z
    .string()
    .min(10, '대체 텍스트는 최소 10자 이상이어야 합니다.')
    .max(200, '대체 텍스트는 200자를 초과할 수 없습니다.'),
});

export type HeroImageUploadInput = z.infer<typeof heroImageUploadSchema>;
```

**클라이언트 사이드 검증 (사용자 경험 향상)**:

```typescript
// app/admin/hero-image/_components/HeroImageUploader.tsx
function validateFileBeforeUpload(file: File): string | null {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 2 * 1024 * 1024;

  if (!ALLOWED_TYPES.includes(file.type)) {
    return '지원되지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다.';
  }

  if (file.size > MAX_SIZE) {
    return '파일 크기가 2MB를 초과합니다.';
  }

  return null; // 유효함
}
```

---

## 마이그레이션 전략

### 초기 테이블 생성

```sql
-- migrations/001_create_hero_images.sql
CREATE TABLE IF NOT EXISTS hero_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0
);

-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_hero_images_is_active ON hero_images(is_active);
```

### Drizzle Kit 마이그레이션 명령

```bash
# 스키마 변경사항을 기반으로 마이그레이션 파일 생성
npx drizzle-kit generate:sqlite

# 마이그레이션 실행
npx drizzle-kit push:sqlite
```

---

## 에지 케이스 처리

### 1. 활성 이미지가 없는 경우
**시나리오**: 데이터베이스에 이미지가 하나도 없거나 모든 이미지가 비활성 상태입니다.

**처리 방법**:
```typescript
// app/(home)/page.tsx
const heroImage = await getActiveHeroImage();

if (!heroImage) {
  // 기본 이미지 또는 그라디언트 배경 표시
  return <HeroSection fallbackMode />;
}
```

---

### 2. 이미지 파일이 삭제되었지만 DB 레코드는 남아있는 경우
**시나리오**: 파일 시스템에서 이미지 파일이 수동으로 삭제되었지만 데이터베이스 레코드는 존재합니다.

**처리 방법**:
```typescript
// Next.js Image 컴포넌트는 자동으로 404 에러 이미지 표시
// 추가로 onError 핸들러로 Fallback UI 제공

<Image
  src={heroImage.url}
  alt={heroImage.altText}
  fill
  priority
  onError={(e) => {
    // Fallback 이미지로 교체
    e.currentTarget.src = '/images/hero-fallback.jpg';
  }}
/>
```

---

### 3. 동시 업로드 시도
**시나리오**: 두 명의 관리자가 동시에 이미지를 업로드하고 활성화하려고 합니다.

**처리 방법**:
- 데이터베이스 트랜잭션을 사용하여 ACID 속성 보장
- 마지막 트랜잭션이 최종 활성 이미지가 됩니다 (Last Write Wins)

---

## 요약

### 주요 엔티티
1. **HeroImage**: SQLite 테이블, 이미지 메타데이터 저장, 단일 활성 이미지 규칙
2. **ServiceCard**: 정적 TypeScript 배열, 3개 고정 카드

### 주요 비즈니스 규칙
- 한 번에 하나의 활성 히어로 이미지만 존재
- 파일 크기 2MB 이하, JPG/PNG/WebP 타입만 허용
- 활성 이미지는 삭제 불가

### 다음 단계
1. `contracts/hero-api.yaml`: API 엔드포인트 OpenAPI 스펙 작성
2. `quickstart.md`: 로컬 개발 환경 설정 가이드 작성

---

**작성일**: 2025-11-18
**작성자**: Claude Code (Spec Kit 워크플로우)
