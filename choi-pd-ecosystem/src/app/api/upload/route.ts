import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 제공되지 않았습니다' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB를 초과할 수 없습니다' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    const filepath = path.join(uploadDir, filename);

    // 파일 저장
    await writeFile(filepath, buffer);

    // URL 반환
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      message: '파일이 성공적으로 업로드되었습니다',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: '파일 업로드에 실패했습니다' },
      { status: 500 }
    );
  }
}
