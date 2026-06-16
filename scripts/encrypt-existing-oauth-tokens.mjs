import { createCipheriv, randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const tokenPrefix = "enc:v1:";
const algorithm = "aes-256-gcm";
const ivLength = 12;
const authTagLength = 16;

function getTokenEncryptionKey() {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_SECRET is required to encrypt existing OAuth tokens."
    );
  }

  const key = Buffer.from(secret, "base64");

  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_SECRET must be a 32-byte base64 encoded secret."
    );
  }

  return key;
}

function encryptToken(value, key) {
  if (!value || value.startsWith(tokenPrefix)) {
    return value;
  }

  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv, { authTagLength });
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

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  const key = getTokenEncryptionKey();
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      id_token: true,
    },
  });
  let updatedAccounts = 0;
  let encryptedFields = 0;

  for (const account of accounts) {
    const data = {};

    for (const field of ["access_token", "refresh_token", "id_token"]) {
      const value = account[field];
      const encrypted = typeof value === "string" ? encryptToken(value, key) : value;

      if (encrypted !== value) {
        data[field] = encrypted;
        encryptedFields += 1;
      }
    }

    if (Object.keys(data).length > 0) {
      await prisma.account.update({
        where: { id: account.id },
        data,
      });
      updatedAccounts += 1;
    }
  }

  console.log(
    JSON.stringify({
      accountsScanned: accounts.length,
      accountsUpdated: updatedAccounts,
      encryptedFields,
    })
  );
} finally {
  await prisma.$disconnect();
}
