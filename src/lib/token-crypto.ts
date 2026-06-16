import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const tokenPrefix = "enc:v1:";
const algorithm = "aes-256-gcm";
const ivLength = 12;
const authTagLength = 16;

let cachedKey: Buffer | null = null;

function getTokenEncryptionKey() {
  if (cachedKey) {
    return cachedKey;
  }

  const secret = process.env.TOKEN_ENCRYPTION_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_SECRET is required to encrypt OAuth tokens at rest."
    );
  }

  const key = Buffer.from(secret, "base64");

  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_SECRET must be a 32-byte base64 encoded secret."
    );
  }

  cachedKey = key;

  return cachedKey;
}

export function isEncryptedToken(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(tokenPrefix);
}

export function encryptToken(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (isEncryptedToken(value)) {
    return value;
  }

  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, getTokenEncryptionKey(), iv, {
    authTagLength,
  });
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    "enc",
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptToken(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (!isEncryptedToken(value)) {
    return value;
  }

  const [, version, iv, authTag, ciphertext] = value.split(":");

  if (version !== "v1" || !iv || !authTag || !ciphertext) {
    throw new Error("Encrypted OAuth token format is invalid.");
  }

  const decipher = createDecipheriv(
    algorithm,
    getTokenEncryptionKey(),
    Buffer.from(iv, "base64url"),
    { authTagLength }
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
