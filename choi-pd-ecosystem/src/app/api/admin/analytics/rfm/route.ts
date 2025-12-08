import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfmSegments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Calculate RFM segment based on scores
function calculateRfmSegment(recency: number, frequency: number, monetary: number): string {
  const total = recency + frequency + monetary;

  // Champions: High scores across all dimensions
  if (recency >= 4 && frequency >= 4 && monetary >= 4) {
    return 'Champions';
  }

  // Loyal: High frequency and monetary, moderate recency
  if (frequency >= 4 && monetary >= 4) {
    return 'Loyal Customers';
  }

  // Potential Loyalists: Recent customers with good frequency
  if (recency >= 4 && frequency >= 3) {
    return 'Potential Loyalists';
  }

  // Recent Customers: Very recent but low frequency
  if (recency >= 4 && frequency <= 2) {
    return 'Recent Customers';
  }

  // Promising: Recent and some spending
  if (recency >= 3 && monetary >= 3) {
    return 'Promising';
  }

  // Needs Attention: Above average but declining
  if (recency === 3 && frequency === 3) {
    return 'Needs Attention';
  }

  // About to Sleep: Below average recency
  if (recency === 2 && frequency <= 2) {
    return 'About to Sleep';
  }

  // At Risk: Used to be good customers
  if (recency <= 2 && frequency >= 3 && monetary >= 3) {
    return 'At Risk';
  }

  // Cannot Lose Them: Made big purchases but long ago
  if (recency <= 2 && frequency >= 4 && monetary >= 4) {
    return 'Cannot Lose Them';
  }

  // Hibernating: Low scores across the board
  if (recency <= 2 && frequency <= 2 && monetary <= 2) {
    return 'Hibernating';
  }

  // Lost: Very low recency
  if (recency === 1) {
    return 'Lost';
  }

  return 'Others';
}

// Create or update RFM segment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      userType,
      recencyScore,
      frequencyScore,
      monetaryScore,
      lastActivityAt,
      totalTransactions,
      totalRevenue
    } = body;

    // Validation
    if (!userId || !userType || !recencyScore || !frequencyScore || !monetaryScore) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate scores are 1-5
    if (recencyScore < 1 || recencyScore > 5 ||
        frequencyScore < 1 || frequencyScore > 5 ||
        monetaryScore < 1 || monetaryScore > 5) {
      return NextResponse.json(
        { success: false, error: 'Scores must be between 1 and 5' },
        { status: 400 }
      );
    }

    const rfmSegment = calculateRfmSegment(recencyScore, frequencyScore, monetaryScore);

    const [segment] = await db.insert(rfmSegments).values({
      userId,
      userType,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmSegment,
      lastActivityAt: lastActivityAt ? new Date(lastActivityAt) : null,
      totalTransactions: totalTransactions || 0,
      totalRevenue: totalRevenue || 0
    }).returning();

    return NextResponse.json({ success: true, data: segment });
  } catch (error: any) {
    console.error('Error creating RFM segment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get RFM segments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rfmSegment = searchParams.get('segment') || undefined;
    const userType = searchParams.get('userType') || undefined;

    let query = db.select().from(rfmSegments);
    const conditions: any[] = [];

    if (rfmSegment) {
      conditions.push(eq(rfmSegments.rfmSegment, rfmSegment));
    }

    if (userType) {
      conditions.push(eq(rfmSegments.userType, userType as any));
    }

    if (conditions.length > 0) {
      const { and } = await import('drizzle-orm');
      query = query.where(and(...conditions)) as any;
    }

    const segments = await query.orderBy(desc(rfmSegments.calculatedAt));

    return NextResponse.json({ success: true, data: segments });
  } catch (error: any) {
    console.error('Error fetching RFM segments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
