import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faqKnowledgeBase } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Create FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      category,
      question,
      answer,
      keywords,
      priority,
      createdBy
    } = body;

    // Validation
    if (!category || !question || !answer || !keywords || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [faq] = await db.insert(faqKnowledgeBase).values({
      category,
      question,
      answer,
      keywords: JSON.stringify(keywords),
      priority: priority || 0,
      createdBy
    }).returning();

    // Parse JSON fields
    const parsed = {
      ...faq,
      keywords: faq.keywords ? JSON.parse(faq.keywords) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get FAQs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const isActive = searchParams.get('isActive') || undefined;

    let query = db.select().from(faqKnowledgeBase);
    const conditions: any[] = [];

    if (category) {
      conditions.push(eq(faqKnowledgeBase.category, category as any));
    }

    if (isActive !== undefined) {
      conditions.push(eq(faqKnowledgeBase.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
      const { and } = await import('drizzle-orm');
      query = query.where(and(...conditions)) as any;
    }

    const faqs = await query.orderBy(
      desc(faqKnowledgeBase.priority),
      desc(faqKnowledgeBase.createdAt)
    );

    // Parse JSON fields
    const parsed = faqs.map((faq) => ({
      ...faq,
      keywords: faq.keywords ? JSON.parse(faq.keywords) : null
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
