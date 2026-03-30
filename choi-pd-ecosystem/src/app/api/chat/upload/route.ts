import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { memberUploads, members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find member by session userId
    const member = await db.query.members.findFirst({
      where: and(eq(members.towningraphUserId, session.userId), tenantFilter(members.tenantId, tenantId)),
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `허용되지 않는 파일 형식입니다. (${ALLOWED_TYPES.join(', ')})` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Prepare directory and filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}_${safeName}`;
    const dirPath = path.join(process.cwd(), 'public', 'uploads', 'members', String(member.id));
    const filePath = path.join(dirPath, filename);
    const publicUrl = `/uploads/members/${member.id}/${filename}`;

    // Create directory and write file
    await mkdir(dirPath, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save to database
    const [upload] = await db.insert(memberUploads).values(withTenantId({
      memberId: member.id,
      filename: file.name,
      storagePath: publicUrl,
      fileSize: file.size,
      mimeType: file.type,
    }, tenantId)).returning();

    return NextResponse.json({
      success: true,
      data: {
        id: upload.id,
        url: publicUrl,
        filename: file.name,
      },
    });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
