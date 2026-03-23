import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Kita gunakan AUTH_SECRET (atau NEXTAUTH_SECRET) sebagai kunci. Fallback random jika tidak ada.
const ENV_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'RahasiaPalingAmanSIAKAD202612345';

// Pastikan kunci benar-benar sepanjang 32 character untuk AES-256
function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(String(ENV_SECRET)).digest().subarray(0, 32);
}

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = getDerivedKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Gagal mengenkripsi data");
  }
}

export function decrypt(text: string): string | null {
  try {
    const parts = text.split(':');
    if (parts.length !== 3) return null; // Format tidak valid
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const key = getDerivedKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
