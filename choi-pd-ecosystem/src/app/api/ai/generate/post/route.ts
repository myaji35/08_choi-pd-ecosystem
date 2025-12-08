import { NextRequest, NextResponse } from 'next/server';
import { generateSnsPost } from '@/lib/ai';

// POST /api/ai/generate/post - Generate SNS post draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { topic, platform, tone, userId, userType } = body;

    // Validation
    if (!topic || !platform || !userId || !userType) {
      return NextResponse.json(
        { success: false, error: 'topic, platform, userId, and userType are required' },
        { status: 400 }
      );
    }

    if (!['facebook', 'instagram', 'twitter', 'linkedin'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      );
    }

    if (!['distributor', 'pd', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userType' },
        { status: 400 }
      );
    }

    const generatedPost = await generateSnsPost({
      topic,
      platform,
      tone: tone || 'professional',
      userId,
      userType
    });

    return NextResponse.json({
      success: true,
      data: {
        post: generatedPost,
        platform,
        topic
      }
    });
  } catch (error: any) {
    console.error('Error generating SNS post:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
