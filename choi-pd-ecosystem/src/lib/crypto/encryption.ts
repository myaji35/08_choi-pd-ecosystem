import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Create a 32-byte key from the environment variable
  return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(text: string): string {
  if (!text) return '';

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine iv + tag + encrypted data
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';

  try {
    const key = getEncryptionKey();

    // Extract iv, tag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
    const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
    const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
