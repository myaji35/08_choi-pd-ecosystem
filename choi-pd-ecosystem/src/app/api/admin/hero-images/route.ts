import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

const heroImagesSchema = z.object({
  images: z.array(z.string().url()).max(5, '최대 5개의 이미지만 등록할 수 있습니다'),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const validatedData = heroImagesSchema.parse(body);

    // 테넌트별 hero_images 설정 조회
    const existing = await db
      .select()
      .from(settings)
      .where(and(
        tenantFilter(settings.tenantId, tenantId),
        eq(settings.key, 'hero_images')
      ))
      .get();

    const imagesJson = JSON.stringify(validatedData.images);

    if (existing) {
      await db.update(settings)
        .set({ value: imagesJson, updatedAt: new Date() })
        .where(and(
          tenantFilter(settings.tenantId, tenantId),
          eq(settings.key, 'hero_images')
        ));
    } else {
      await db.insert(settings).values(
        withTenantId({
          key: 'hero_images',
          value: imagesJson,
        }, tenantId)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hero 이미지가 업데이트되었습니다',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Hero images update error:', error);
    return NextResponse.json(
      { success: false, error: 'Hero 이미지 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}
