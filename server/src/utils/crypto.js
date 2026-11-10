import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16;

// Derive a consistent 32-byte key from JWT_SECRET or fallback
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'ormayundo-default-encryption-key-32-chars!';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypts a sensitive string (such as an API key) using AES-256-GCM.
 */
export function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  // Return iv:tag:ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a ciphertext encrypted by AES-256-GCM.
 * If decryption fails or text is raw (legacy plain text), gracefully handles it.
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return '';
  // Check if formatted as iv:tag:ciphertext
  const parts = String(encryptedData).split(':');
  if (parts.length !== 3) {
    // Legacy unencrypted string
    return encryptedData;
  }
  try {
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('[Crypto] Decryption failed, returning raw string or empty:', err.message);
    return encryptedData;
  }
}

/**
 * Masks an API key for safe presentation in admin UI (e.g. gsk_••••••••••••3a9f).
 */
export function maskApiKey(key) {
  if (!key || typeof key !== 'string') return 'Not Set';
  const clean = key.trim();
  if (clean.length <= 8) {
    return '••••••••';
  }
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}

