import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().optional(),
  message: z.string().min(10, '최소 10자 이상 입력해주세요'),
  type: z.enum(['b2b', 'contact']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    const result = await db
      .insert(inquiries)
      .values({
        ...validatedData,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Failed to submit inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
