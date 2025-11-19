import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'choi-pd-ecosystem-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // JWT 토큰 검증
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 인증 정보입니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일 확장자 추출
    const extension = file.name.split('.').pop() || 'jpg';

    // public/images 디렉토리에 profile.jpg로 저장
    const filePath = join(process.cwd(), 'public', 'images', `profile.jpg`);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: '/images/profile.jpg',
      message: '프로필 사진이 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    return NextResponse.json(
      { success: false, error: '업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
