import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faqKnowledgeBase } from '@/lib/db/schema';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// Create FAQ
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
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

    const [faq] = await db.insert(faqKnowledgeBase).values(withTenantId({
      category,
      question,
      answer,
      keywords: JSON.stringify(keywords),
      priority: priority || 0,
      createdBy
    }, tenantId)).returning();

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
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const isActive = searchParams.get('isActive') || undefined;

    const conditions: SQL[] = [tenantFilter(faqKnowledgeBase.tenantId, tenantId)];

    if (category) {
      conditions.push(eq(faqKnowledgeBase.category, category as 'general' | 'distributor' | 'payment' | 'resource' | 'technical'));
    }

    if (isActive !== undefined) {
      conditions.push(eq(faqKnowledgeBase.isActive, isActive === 'true'));
    }

    const faqs = await db.select().from(faqKnowledgeBase)
      .where(and(...conditions))
      .orderBy(
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
