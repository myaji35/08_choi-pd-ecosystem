/**
 * 일회성 마이그레이션: snsAccounts의 평문 access/refresh 토큰을 AES-256-GCM 암호화로 전환.
 *
 * 실행:
 *   ENCRYPTION_KEY=... npx tsx scripts/encrypt-sns-tokens.ts
 *
 * 멱등성: 이미 `enc:v1:` 접두사를 가진 행은 건너뜀. 여러 번 실행 가능.
 */
import { db } from '../src/lib/db';
import { snsAccounts } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encryptToken, isEncrypted } from '../src/lib/crypto/token-cipher';

async function main() {
  const rows = await db.select().from(snsAccounts).all();
  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const needsAccess = row.accessToken && !isEncrypted(row.accessToken);
    const needsRefresh = row.refreshToken && !isEncrypted(row.refreshToken);

    if (!needsAccess && !needsRefresh) {
      skipped++;
      continue;
    }

    await db
      .update(snsAccounts)
      .set({
        accessToken: needsAccess ? encryptToken(row.accessToken) : row.accessToken,
        refreshToken: needsRefresh ? encryptToken(row.refreshToken!) : row.refreshToken,
      })
      .where(eq(snsAccounts.id, row.id));

    migrated++;
  }

  console.log(`[encrypt-sns-tokens] migrated: ${migrated}, already-encrypted: ${skipped}, total: ${rows.length}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
