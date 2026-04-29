import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * تشفير البيانات الحساسة
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-key-change-me',
    salt,
    KEY_LENGTH
  );
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // salt:iv:tag:encrypted
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * فك تشفير البيانات
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 4) throw new Error('Invalid encrypted format');
  
  const salt = Buffer.from(parts[0], 'hex');
  const iv = Buffer.from(parts[1], 'hex');
  const tag = Buffer.from(parts[2], 'hex');
  const encrypted = parts[3];
  
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-key-change-me',
    salt,
    KEY_LENGTH
  );
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * توليد مفتاح API آمن
 */
export function generateSecureToken(length: number = 48): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

/**
 * حساب HMAC للتوقيع الرقمي
 */
export function signRequest(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * التحقق من التوقيع الرقمي
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = signRequest(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * حساب SHA-256 للملفات
 */
export function hashFile(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
