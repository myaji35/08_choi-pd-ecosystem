import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema/distribution';
import { parseIdentityMarkdown } from '@/lib/identity/parser';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 512 * 1024; // 512KB — .md는 사실상 차고 넘침
const ALLOWED_EXT = ['.md', '.markdown', '.txt'];

async function resolveDistributorId(idOrSlug: string): Promise<number | null> {
  const asNum = Number(idOrSlug);
  if (Number.isFinite(asNum) && asNum > 0) return asNum;
  const rows = await db
    .select({ id: distributors.id })
    .from(distributors)
    .where(eq(distributors.slug, idOrSlug))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = await resolveDistributorId(idParam);
  if (!id) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });

  const rows = await db
    .select({
      identityMd: distributors.identityMd,
      identityFilename: distributors.identityFilename,
      identityUpdatedAt: distributors.identityUpdatedAt,
      identityJson: distributors.identityJson,
      identityParsedAt: distributors.identityParsedAt,
    })
    .from(distributors)
    .where(eq(distributors.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
  }

  // parsedJson이 비어 있으면(과거 업로드 호환) 즉석 파싱해서 캐시에 반영
  let parsed = rows[0].identityJson
    ? safeJson(rows[0].identityJson)
    : null;

  if (!parsed && rows[0].identityMd) {
    parsed = parseIdentityMarkdown(rows[0].identityMd);
    await db
      .update(distributors)
      .set({ identityJson: JSON.stringify(parsed), identityParsedAt: new Date() })
      .where(eq(distributors.id, id));
  }

  return NextResponse.json({
    success: true,
    identity: {
      content: rows[0].identityMd ?? '',
      filename: rows[0].identityFilename ?? null,
      updatedAt: rows[0].identityUpdatedAt ?? null,
      parsed: parsed,
      parsedAt: rows[0].identityParsedAt ?? null,
    },
  });
}

function safeJson<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = await resolveDistributorId(idParam);
  if (!id) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });

  const ct = req.headers.get('content-type') || '';
  let content = '';
  let filename = 'identity.md';

  try {
    if (ct.includes('multipart/form-data')) {
      const fd = await req.formData();
      const file = fd.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'FILE_REQUIRED', message: '파일(file) 필드가 필요합니다.' },
          { status: 400 },
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { success: false, error: 'FILE_TOO_LARGE', message: `최대 ${MAX_BYTES / 1024}KB 까지 업로드 가능합니다.` },
          { status: 413 },
        );
      }
      const lower = (file.name || '').toLowerCase();
      const extOk = ALLOWED_EXT.some((e) => lower.endsWith(e));
      if (!extOk) {
        return NextResponse.json(
          { success: false, error: 'BAD_EXT', message: '.md / .markdown / .txt 파일만 허용됩니다.' },
          { status: 415 },
        );
      }
      filename = file.name || filename;
      content = await file.text();
    } else {
      // JSON body: { content: "…", filename?: "…" }
      const body = await req.json().catch(() => null);
      if (!body || typeof body.content !== 'string') {
        return NextResponse.json(
          { success: false, error: 'CONTENT_REQUIRED' },
          { status: 400 },
        );
      }
      content = body.content;
      if (typeof body.filename === 'string' && body.filename.trim()) {
        filename = body.filename.trim();
      }
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'PARSE_ERROR', message: (err as Error).message },
      { status: 400 },
    );
  }

  if (content.length > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: 'CONTENT_TOO_LARGE' },
      { status: 413 },
    );
  }

  const parsed = parseIdentityMarkdown(content);

  await db
    .update(distributors)
    .set({
      identityMd: content,
      identityFilename: filename,
      identityUpdatedAt: new Date(),
      identityJson: JSON.stringify(parsed),
      identityParsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(distributors.id, id));

  return NextResponse.json({
    success: true,
    identity: {
      content,
      filename,
      updatedAt: new Date().toISOString(),
      bytes: content.length,
      parsed,
      parsedAt: new Date().toISOString(),
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = await resolveDistributorId(idParam);
  if (!id) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });

  await db
    .update(distributors)
    .set({
      identityMd: null,
      identityFilename: null,
      identityUpdatedAt: null,
      identityJson: null,
      identityParsedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(distributors.id, id));

  return NextResponse.json({ success: true });
}
