import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai';

// POST /api/ai/embeddings - Generate embedding for content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { contentType, contentId, textContent, metadata } = body;

    // Validation
    if (!contentType || !contentId || !textContent) {
      return NextResponse.json(
        { success: false, error: 'contentType, contentId, and textContent are required' },
        { status: 400 }
      );
    }

    if (!['resource', 'course', 'post', 'work'].includes(contentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contentType' },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding({
      contentType,
      contentId,
      textContent,
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      data: {
        contentType,
        contentId,
        embeddingDimension: embedding.length,
        message: 'Embedding generated successfully'
      }
    });
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
