import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).get();
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Plan GET failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { displayName, description, price, features, maxDistributors, maxResources, isActive } =
      body;

    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (features !== undefined) {
      updateData.features = Array.isArray(features) ? JSON.stringify(features) : features;
    }
    if (maxDistributors !== undefined) updateData.maxDistributors = maxDistributors;
    if (maxResources !== undefined) updateData.maxResources = maxResources;
    if (isActive !== undefined) updateData.isActive = !!isActive;
    updateData.updatedAt = new Date();

    const result = await db
      .update(subscriptionPlans)
      .set(updateData)
      .where(eq(subscriptionPlans.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, plan: result[0] });
  } catch (error) {
    console.error('Plan PATCH failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const deleted = await db
      .delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Plan DELETE failed:', error);
    return NextResponse.json(
      { success: false, error: '삭제 실패: 연결된 결제나 수요자가 있을 수 있습니다.' },
      { status: 500 }
    );
  }
}
