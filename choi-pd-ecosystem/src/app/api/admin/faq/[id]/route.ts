import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faqKnowledgeBase } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Update FAQ
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqId = parseInt(params.id);
    const body = await request.json();

    const {
      question,
      answer,
      keywords,
      priority,
      isActive
    } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (keywords !== undefined) updateData.keywords = JSON.stringify(keywords);
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db.update(faqKnowledgeBase)
      .set(updateData)
      .where(eq(faqKnowledgeBase.id, faqId))
      .returning();

    // Parse JSON fields
    const parsed = {
      ...updated,
      keywords: updated.keywords ? JSON.parse(updated.keywords) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqId = parseInt(params.id);

    await db.delete(faqKnowledgeBase).where(eq(faqKnowledgeBase.id, faqId));

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
