/**
 * SNS 액세스/리프레시 토큰 암호화 유틸 (AES-256-GCM)
 *
 * 용도: snsAccounts.accessToken/refreshToken 평문 저장 방지 (개인정보보호법 §29 안전성 확보조치).
 *
 * 포맷 (저장): `enc:v1:<iv_b64>:<authTag_b64>:<ciphertext_b64>`
 *   - 접두사 `enc:v1:` 로 암호화 여부 판별 (기존 평문과 공존 가능 → 점진 마이그레이션 지원)
 *
 * 키: process.env.ENCRYPTION_KEY (32바이트 권장, SHA-256 로 정규화)
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set (>= 16 chars) in production');
    }
    // dev fallback — deterministic key from fixed string
    return createHash('sha256').update('impd-dev-only-not-for-prod').digest();
  }
  return createHash('sha256').update(raw).digest();
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

export function encryptToken(plaintext: string): string {
  if (!plaintext) return plaintext;
  if (isEncrypted(plaintext)) return plaintext; // 이미 암호화됨

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!isEncrypted(stored)) return stored; // 평문 레거시 — 마이그레이션 전에는 그대로 반환

  try {
    const payload = stored.slice(PREFIX.length);
    const [ivB64, tagB64, dataB64] = payload.split(':');
    if (!ivB64 || !tagB64 || !dataB64) return null;

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');

    const decipher = createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    return plaintext.toString('utf8');
  } catch (err) {
    console.error('[token-cipher] decrypt failed', err);
    return null;
  }
}

/**
 * 응답용: 토큰을 마스킹 (예: "enc:v1:abc..." → "****abc")
 * 저장 토큰을 API 응답에 그대로 내보내지 않기 위함.
 */
export function maskToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const plain = decryptToken(stored);
  if (!plain) return '****';
  if (plain.length <= 4) return '****';
  return '****' + plain.slice(-4);
}
