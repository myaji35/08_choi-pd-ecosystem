import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

const CONTACT_KEYS = ['profile_phone', 'profile_email'] as const;

export interface ContactInfo {
  phone: string | null;
  email: string | null;
}

/**
 * DB settings에서 연락처 정보를 가져온다.
 * 공개 페이지(Footer, 교육 등)에서 사용.
 */
export async function getContactInfo(): Promise<ContactInfo> {
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, [...CONTACT_KEYS]),
  });

  const getValue = (key: string): string | null =>
    rows.find((r: { key: string; value: string }) => r.key === key)?.value || null;

  return {
    phone: getValue('profile_phone'),
    email: getValue('profile_email'),
  };
}
