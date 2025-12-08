import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/notifications?userType=admin&limit=50 - Get notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') || 'admin';
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userType, userType as any));

    if (unreadOnly) {
      query = query.where(and(
        eq(notifications.userType, userType as any),
        eq(notifications.isRead, false)
      )) as any;
    }

    const results = await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .all();

    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userType, userType as any),
        eq(notifications.isRead, false)
      ))
      .get();

    return NextResponse.json({
      success: true,
      notifications: results,
      unreadCount: unreadCount?.count || 0,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, type, category, title, message, link, metadata } = body;

    if (!userType || !category || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(notifications)
      .values({
        userType,
        type: type || 'info',
        category,
        title,
        message,
        link,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning()
      .get();

    return NextResponse.json({
      success: true,
      notification: result,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, markAllAsRead, userType } = body;

    if (markAllAsRead && userType) {
      // Mark all notifications as read for user type
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userType, userType))
        .run();

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'Notification IDs required' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    for (const id of notificationIds) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .run();
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notification(s) marked as read`,
    });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
