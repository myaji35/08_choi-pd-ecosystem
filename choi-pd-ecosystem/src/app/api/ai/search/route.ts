import { NextRequest, NextResponse } from 'next/server';
import { findSimilarContent } from '@/lib/ai';

// POST /api/ai/search - Semantic search using embeddings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { query, contentType, limit } = body;

    // Validation
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'query is required' },
        { status: 400 }
      );
    }

    if (contentType && !['resource', 'course', 'post', 'work'].includes(contentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contentType' },
        { status: 400 }
      );
    }

    const results = await findSimilarContent({
      queryText: query,
      contentType,
      limit: limit || 10
    });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error: any) {
    console.error('Error in semantic search:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
