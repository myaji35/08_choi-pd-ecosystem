import { db } from '../index';
import { heroImages, type HeroImage, type NewHeroImage } from '../schema';
import { eq, desc } from 'drizzle-orm';

/**
 * 현재 활성화된 히어로 이미지 조회
 */
export async function getActiveHeroImage(): Promise<HeroImage | null> {
  const result = await db
    .select()
    .from(heroImages)
    .where(eq(heroImages.isActive, true))
    .limit(1);

  return result[0] || null;
}

/**
 * 모든 히어로 이미지 조회 (최신순)
 */
export async function getAllHeroImages(): Promise<HeroImage[]> {
  return await db
    .select()
    .from(heroImages)
    .orderBy(desc(heroImages.uploadedAt));
}

/**
 * ID로 히어로 이미지 조회
 */
export async function getHeroImageById(id: number): Promise<HeroImage | null> {
  const result = await db
    .select()
    .from(heroImages)
    .where(eq(heroImages.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * 새 히어로 이미지 삽입
 */
export async function insertHeroImage(data: NewHeroImage): Promise<HeroImage> {
  const result = await db.insert(heroImages).values(data).returning();
  return result[0];
}

/**
 * 히어로 이미지 업로드 상태 업데이트
 */
export async function updateHeroImageStatus(
  id: number,
  status: 'pending' | 'completed' | 'failed'
): Promise<HeroImage | null> {
  const result = await db
    .update(heroImages)
    .set({ uploadStatus: status })
    .where(eq(heroImages.id, id))
    .returning();

  return result[0] || null;
}

/**
 * 히어로 이미지 활성화 (기존 활성 이미지는 자동 비활성화)
 */
export async function activateHeroImage(id: number): Promise<HeroImage | null> {
  // 트랜잭션으로 처리
  return await db.transaction(async (tx) => {
    // 1. 모든 이미지 비활성화
    await tx
      .update(heroImages)
      .set({ isActive: false })
      .where(eq(heroImages.isActive, true));

    // 2. 지정된 이미지 활성화 (upload_status가 'completed'인 경우에만)
    const result = await tx
      .update(heroImages)
      .set({ isActive: true })
      .where(eq(heroImages.id, id))
      .returning();

    return result[0] || null;
  });
}

/**
 * 히어로 이미지 업로드 및 활성화 (한 번에)
 */
export async function uploadAndActivateHeroImage(data: NewHeroImage): Promise<HeroImage> {
  return await db.transaction(async (tx) => {
    // 1. 모든 기존 이미지 비활성화
    await tx
      .update(heroImages)
      .set({ isActive: false })
      .where(eq(heroImages.isActive, true));

    // 2. 새 이미지 삽입 및 활성화
    const result = await tx.insert(heroImages).values({
      ...data,
      isActive: true,
      uploadStatus: 'completed',
    }).returning();

    return result[0];
  });
}

/**
 * 히어로 이미지 삭제
 */
export async function deleteHeroImage(id: number): Promise<boolean> {
  const result = await db
    .delete(heroImages)
    .where(eq(heroImages.id, id))
    .returning();

  return result.length > 0;
}

/**
 * 활성화되지 않은 이미지 삭제 (cleanup)
 */
export async function deleteInactiveHeroImages(): Promise<number> {
  const result = await db
    .delete(heroImages)
    .where(eq(heroImages.isActive, false))
    .returning();

  return result.length;
}

/**
 * 업로드 실패한 이미지 삭제 (cleanup)
 */
export async function deleteFailedUploads(): Promise<number> {
  const result = await db
    .delete(heroImages)
    .where(eq(heroImages.uploadStatus, 'failed'))
    .returning();

  return result.length;
}
