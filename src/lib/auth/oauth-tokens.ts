import "server-only";

import type { Account } from "next-auth";
import type { AdapterAccount } from "next-auth/adapters";

import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/token-crypto";

const azureDevOpsScope =
  "openid profile email offline_access https://app.vssps.visualstudio.com/.default";
const refreshSafetyBufferSeconds = 5 * 60;

type OAuthTokenAccount = Pick<
  AdapterAccount,
  | "userId"
  | "type"
  | "provider"
  | "providerAccountId"
  | "refresh_token"
  | "access_token"
  | "expires_at"
  | "token_type"
  | "scope"
  | "id_token"
> & {
  session_state?: unknown;
};

type SignInAccount = Account & {
  userId?: string;
};

type MicrosoftRefreshTokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  id_token?: unknown;
  expires_in?: unknown;
  scope?: unknown;
  token_type?: unknown;
};

export class AzureTokenRefreshError extends Error {
  constructor(
    message = "Your Microsoft session expired. Please sign in again.",
    public readonly code = "AZURE_SESSION_EXPIRED"
  ) {
    super(message);
    this.name = "AzureTokenRefreshError";
  }
}

function encryptedValue(value: string | null | undefined) {
  return typeof value === "string" ? encryptToken(value) : value;
}

function getAzureTenantIdFromIssuer(issuer?: string) {
  if (!issuer) {
    return null;
  }

  try {
    const { pathname } = new URL(issuer);
    const [tenantId] = pathname.split("/").filter(Boolean);

    return tenantId ?? null;
  } catch {
    return null;
  }
}

function getAzureClientConfig() {
  const clientId =
    process.env.AZURE_AD_CLIENT_ID ??
    process.env.AUTH_AZURE_AD_CLIENT_ID ??
    process.env.AUTH_AZURE_AD_ID ??
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const clientSecret =
    process.env.AZURE_AD_CLIENT_SECRET ??
    process.env.AUTH_AZURE_AD_CLIENT_SECRET ??
    process.env.AUTH_AZURE_AD_SECRET ??
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
  const tenantId =
    process.env.AZURE_AD_TENANT_ID ??
    process.env.AUTH_AZURE_AD_TENANT_ID ??
    process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ??
    getAzureTenantIdFromIssuer(
      process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ??
        process.env.AUTH_AZURE_AD_ISSUER
    );

  if (!clientId || !clientSecret || !tenantId) {
    throw new AzureTokenRefreshError(
      "Microsoft Entra OAuth refresh is not configured on the server."
    );
  }

  return {
    clientId,
    clientSecret,
    tenantId,
  };
}

function tokenExpiresSoon(expiresAt: number | null | undefined) {
  if (typeof expiresAt !== "number") {
    return false;
  }

  return expiresAt <= Math.floor(Date.now() / 1000) + refreshSafetyBufferSeconds;
}

async function refreshAzureAccessToken(refreshToken: string) {
  const { clientId, clientSecret, tenantId } = getAzureClientConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    scope: azureDevOpsScope,
  });

  let response: Response;

  try {
    response = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(
        tenantId
      )}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        cache: "no-store",
      }
    );
  } catch {
    throw new AzureTokenRefreshError();
  }

  if (!response.ok) {
    throw new AzureTokenRefreshError();
  }

  let payload: MicrosoftRefreshTokenResponse;

  try {
    payload = (await response.json()) as MicrosoftRefreshTokenResponse;
  } catch {
    throw new AzureTokenRefreshError();
  }

  if (typeof payload.access_token !== "string") {
    throw new AzureTokenRefreshError();
  }

  return {
    accessToken: payload.access_token,
    refreshToken:
      typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    idToken: typeof payload.id_token === "string" ? payload.id_token : null,
    expiresAt:
      typeof payload.expires_in === "number"
        ? Math.floor(Date.now() / 1000) + payload.expires_in
        : null,
    scope: typeof payload.scope === "string" ? payload.scope : null,
    tokenType: typeof payload.token_type === "string" ? payload.token_type : null,
  };
}

export function getPersistableAccount(account: OAuthTokenAccount) {
  return {
    userId: account.userId,
    type: account.type,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: encryptedValue(account.refresh_token),
    access_token: encryptedValue(account.access_token),
    expires_at: account.expires_at,
    token_type: account.token_type,
    scope: account.scope,
    id_token: encryptedValue(account.id_token),
    session_state:
      typeof account.session_state === "string"
        ? account.session_state
        : undefined,
  };
}

export async function persistEncryptedOAuthTokensForSignIn(
  userId: string,
  account: SignInAccount | null
) {
  if (!account?.provider || !account.providerAccountId) {
    return;
  }

  const data: {
    access_token?: string | null;
    refresh_token?: string | null;
    id_token?: string | null;
    expires_at?: number | null;
    scope?: string | null;
    token_type?: string | null;
    session_state?: string | null;
  } = {};

  if ("access_token" in account) {
    data.access_token = encryptedValue(account.access_token);
  }

  if ("refresh_token" in account) {
    data.refresh_token = encryptedValue(account.refresh_token);
  }

  if ("id_token" in account) {
    data.id_token = encryptedValue(account.id_token);
  }

  if ("expires_at" in account) {
    data.expires_at = account.expires_at ?? null;
  }

  if ("scope" in account) {
    data.scope = account.scope ?? null;
  }

  if ("token_type" in account) {
    data.token_type = account.token_type ?? null;
  }

  if (typeof account.session_state === "string") {
    data.session_state = account.session_state;
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  await prisma.account.updateMany({
    where: {
      userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    },
    data,
  });
}

export async function getOAuthTokensForUser(userId: string): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
  scope: string | null;
}> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "azure-ad",
    },
    select: {
      access_token: true,
      refresh_token: true,
      id_token: true,
      expires_at: true,
      scope: true,
    },
  });

  return {
    accessToken: decryptToken(account?.access_token),
    refreshToken: decryptToken(account?.refresh_token),
    idToken: decryptToken(account?.id_token),
    expiresAt: account?.expires_at ?? null,
    scope: account?.scope ?? null,
  };
}

export async function getAzureAdAccessTokenForUser(userId: string): Promise<{
  accessToken: string | null;
  expiresAt: number | null;
}> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "azure-ad",
    },
    select: {
      access_token: true,
      expires_at: true,
    },
  });

  return {
    accessToken: decryptToken(account?.access_token),
    expiresAt: account?.expires_at ?? null,
  };
}

export async function getValidAzureAccessToken(userId: string): Promise<{
  accessToken: string;
  expiresAt: number | null;
  refreshed: boolean;
}> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "azure-ad",
    },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account) {
    throw new AzureTokenRefreshError(
      "No Microsoft account is linked for this session."
    );
  }

  const currentAccessToken = decryptToken(account.access_token);

  if (currentAccessToken && !tokenExpiresSoon(account.expires_at)) {
    return {
      accessToken: currentAccessToken,
      expiresAt: account.expires_at ?? null,
      refreshed: false,
    };
  }

  const currentRefreshToken = decryptToken(account.refresh_token);

  if (!currentRefreshToken) {
    throw new AzureTokenRefreshError(
      "Azure DevOps permissions need to be granted again. Please reconnect your Microsoft account."
    );
  }

  const refreshedToken = await refreshAzureAccessToken(currentRefreshToken);
  const nextExpiresAt = refreshedToken.expiresAt ?? account.expires_at ?? null;

  await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      access_token: encryptToken(refreshedToken.accessToken),
      refresh_token: refreshedToken.refreshToken
        ? encryptToken(refreshedToken.refreshToken)
        : account.refresh_token,
      id_token: refreshedToken.idToken
        ? encryptToken(refreshedToken.idToken)
        : undefined,
      expires_at: nextExpiresAt,
      scope: refreshedToken.scope ?? undefined,
      token_type: refreshedToken.tokenType ?? undefined,
    },
  });

  return {
    accessToken: refreshedToken.accessToken,
    expiresAt: nextExpiresAt,
    refreshed: true,
  };
}
