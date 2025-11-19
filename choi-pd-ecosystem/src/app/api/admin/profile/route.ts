import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  title: z.string().min(1, '직함을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  bio: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // 각 설정 항목을 upsert
    const settingsToUpdate = [
      { key: 'profile_name', value: validatedData.name },
      { key: 'profile_title', value: validatedData.title },
      { key: 'profile_email', value: validatedData.email },
      { key: 'profile_phone', value: validatedData.phone },
      { key: 'profile_bio', value: validatedData.bio || '' },
    ];

    for (const setting of settingsToUpdate) {
      const existing = await db.query.settings.findFirst({
        where: eq(settings.key, setting.key),
      });

      if (existing) {
        await db.update(settings)
          .set({ value: setting.value, updatedAt: new Date() })
          .where(eq(settings.key, setting.key));
      } else {
        await db.insert(settings).values(setting);
      }
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: '프로필 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}
