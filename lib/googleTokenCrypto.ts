import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * El refresh token de Google es una credencial de larga duración con acceso
 * de lectura a los datos reales del negocio (Search Console + Analytics), así
 * que se cifra en reposo en vez de guardarse en texto plano.
 */
function getKey(): Buffer {
  const key = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY no está configurada. Genera una con `openssl rand -base64 32` y añádela a .env.local.",
    );
  }
  const buffer = Buffer.from(key, "base64");
  if (buffer.length !== 32) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY debe ser una clave de 32 bytes en base64.");
  }
  return buffer;
}

export function encryptGoogleToken(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptGoogleToken(ciphertext: string): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Token cifrado con formato inválido.");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}
