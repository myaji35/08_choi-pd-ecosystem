import { NextRequest, NextResponse } from 'next/server';
import { analyzeContentQuality } from '@/lib/ai';

// POST /api/ai/analyze/content - Analyze content quality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { contentType, contentId, content, title } = body;

    // Validation
    if (!contentType || !contentId || !content) {
      return NextResponse.json(
        { success: false, error: 'contentType, contentId, and content are required' },
        { status: 400 }
      );
    }

    if (!['resource', 'course', 'post', 'work'].includes(contentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contentType' },
        { status: 400 }
      );
    }

    const analysis = await analyzeContentQuality({
      contentType,
      contentId,
      content,
      title
    });

    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
