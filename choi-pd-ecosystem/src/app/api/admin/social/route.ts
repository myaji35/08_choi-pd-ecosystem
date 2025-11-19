import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { encrypt } from '@/lib/crypto/encryption';

const socialSchema = z.object({
  facebook: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  instagram: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  youtube: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  linkedin: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  twitter: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  blog: z.string().url('유효한 URL을 입력해주세요').or(z.literal('')),
  facebook_password: z.string().optional(),
  instagram_password: z.string().optional(),
  youtube_password: z.string().optional(),
  linkedin_password: z.string().optional(),
  twitter_password: z.string().optional(),
  blog_password: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = socialSchema.parse(body);

    // 각 소셜 미디어 링크와 암호화된 비밀번호를 upsert
    const settingsToUpdate = [
      { key: 'social_facebook', value: validatedData.facebook },
      { key: 'social_instagram', value: validatedData.instagram },
      { key: 'social_youtube', value: validatedData.youtube },
      { key: 'social_linkedin', value: validatedData.linkedin },
      { key: 'social_twitter', value: validatedData.twitter },
      { key: 'social_blog', value: validatedData.blog },
    ];

    // 비밀번호가 제공된 경우 암호화하여 저장
    if (validatedData.facebook_password) {
      settingsToUpdate.push({ key: 'social_facebook_password', value: encrypt(validatedData.facebook_password) });
    }
    if (validatedData.instagram_password) {
      settingsToUpdate.push({ key: 'social_instagram_password', value: encrypt(validatedData.instagram_password) });
    }
    if (validatedData.youtube_password) {
      settingsToUpdate.push({ key: 'social_youtube_password', value: encrypt(validatedData.youtube_password) });
    }
    if (validatedData.linkedin_password) {
      settingsToUpdate.push({ key: 'social_linkedin_password', value: encrypt(validatedData.linkedin_password) });
    }
    if (validatedData.twitter_password) {
      settingsToUpdate.push({ key: 'social_twitter_password', value: encrypt(validatedData.twitter_password) });
    }
    if (validatedData.blog_password) {
      settingsToUpdate.push({ key: 'social_blog_password', value: encrypt(validatedData.blog_password) });
    }

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
      message: '소셜 미디어 링크가 업데이트되었습니다',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Social media update error:', error);
    return NextResponse.json(
      { success: false, error: '소셜 미디어 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}
