import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai';

// POST /api/ai/recommend - Generate personalized recommendations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, userType, recommendationType, limit } = body;

    // Validation
    if (!userId || !userType || !recommendationType) {
      return NextResponse.json(
        { success: false, error: 'userId, userType, and recommendationType are required' },
        { status: 400 }
      );
    }

    if (!['distributor', 'pd', 'customer'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userType' },
        { status: 400 }
      );
    }

    if (!['resource', 'course', 'post', 'distributor'].includes(recommendationType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recommendationType' },
        { status: 400 }
      );
    }

    const recommendations = await generateRecommendations({
      userId,
      userType,
      recommendationType,
      limit
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
