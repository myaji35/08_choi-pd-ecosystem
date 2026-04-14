import { NextResponse } from 'next/server';
import { loadChoiBrand, saveChoiBrand, validateBrand } from '@/lib/data/choi-brand-store';
import { requireAdmin } from '@/lib/auth/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const brand = await loadChoiBrand();
  return NextResponse.json({ brand });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }
  const v = validateBrand(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const saved = await saveChoiBrand(v.value);

  // audit log 기록 (FIX #13)
  try {
    const { db } = await import('@/lib/db');
    const { auditLogs } = await import('@/lib/db/schema');
    await db.insert(auditLogs).values({
      userId: session.userId,
      userType: session.role === 'admin' ? 'admin' : 'pd',
      userEmail: session.email,
      action: 'UPDATE',
      resource: 'choi_brand',
      metadata: JSON.stringify({ updatedKeys: Object.keys(v.value) }),
    });
  } catch (err) {
    console.warn('[audit] choi_brand_update 로깅 실패', err);
  }

  return NextResponse.json({ ok: true, brand: saved });
}
