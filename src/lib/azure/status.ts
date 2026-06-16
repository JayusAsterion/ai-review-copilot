import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  AzureIntegrationStatus,
  AzureStatusResponse,
} from "@/types/azure";

const tokenExpirySafetyBufferSeconds = 60;

function getIsoFromUnixSeconds(value: number | null | undefined) {
  return typeof value === "number"
    ? new Date(value * 1000).toISOString()
    : null;
}

function isTokenExpired(expiresAt: number | null | undefined) {
  if (typeof expiresAt !== "number") {
    return false;
  }

  const nowWithBuffer =
    Math.floor(Date.now() / 1000) + tokenExpirySafetyBufferSeconds;

  return expiresAt <= nowWithBuffer;
}

function normalizeAzureConnectionStatus(
  rawStatus: string | null | undefined,
  configured: boolean,
  tokenExpired: boolean
): AzureIntegrationStatus {
  if (!configured) {
    return "not_configured";
  }

  if (tokenExpired) {
    return "expired";
  }

  if (rawStatus === "connected") {
    return "connected";
  }

  if (
    rawStatus === "needs_reconnect" ||
    rawStatus === "expired" ||
    rawStatus === "not_connected"
  ) {
    return "needs_reconnect";
  }

  return "unknown";
}

export async function getAzureStatusForUser(
  userId: string
): Promise<AzureStatusResponse | null> {
  const [user, microsoftAccount, azureConnection, azureSelection] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      }),
      prisma.account.findFirst({
        where: {
          userId,
          provider: "azure-ad",
        },
        select: {
          providerAccountId: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
          token_type: true,
          scope: true,
        },
      }),
      prisma.azureConnection.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          organizationName: true,
          organizationUrl: true,
          tenantId: true,
          status: true,
          connectedAt: true,
          lastValidatedAt: true,
        },
      }),
      prisma.azureSelection.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          organization: true,
          projectId: true,
          projectName: true,
          repositoryId: true,
          repositoryName: true,
        },
      }),
    ]);

  if (!user) {
    return null;
  }

  const tokenExpired = isTokenExpired(microsoftAccount?.expires_at);
  const configured = azureConnection?.status === "connected";

  return {
    authenticated: true,
    microsoftAccount: {
      connected: Boolean(microsoftAccount),
      provider: "azure-ad",
      providerAccountId: microsoftAccount?.providerAccountId ?? null,
      user,
      scope: microsoftAccount?.scope ?? null,
      tokenType: microsoftAccount?.token_type ?? null,
      expiresAt: getIsoFromUnixSeconds(microsoftAccount?.expires_at),
      hasAccessToken: Boolean(microsoftAccount?.access_token),
      hasRefreshToken: Boolean(microsoftAccount?.refresh_token),
      isExpired: tokenExpired,
    },
    azureDevOps: {
      configured,
      status: normalizeAzureConnectionStatus(
        azureConnection?.status,
        configured,
        tokenExpired
      ),
      organizationName: azureConnection?.organizationName ?? null,
      organizationUrl: azureConnection?.organizationUrl ?? null,
      tenantId: azureConnection?.tenantId ?? null,
      connectedAt: azureConnection?.connectedAt?.toISOString() ?? null,
      lastValidatedAt:
        azureConnection?.lastValidatedAt?.toISOString() ?? null,
      selection: azureSelection
        ? {
            organization: azureSelection.organization,
            projectId: azureSelection.projectId,
            projectName: azureSelection.projectName,
            repositoryId: azureSelection.repositoryId,
            repositoryName: azureSelection.repositoryName,
          }
        : null,
    },
  };
}
