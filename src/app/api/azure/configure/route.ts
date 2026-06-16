import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  AzureTokenRefreshError,
  getValidAzureAccessToken,
} from "@/lib/auth/oauth-tokens";
import {
  AzureDevOpsRequestError,
  fetchAzureProjects,
  normalizeAzureOrganization,
} from "@/lib/azure-devops";
import { prisma } from "@/lib/prisma";
import type { AzureConfigureResponse } from "@/types/azure";

function jsonError(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

function getAzureDevOpsErrorResponse(error: AzureDevOpsRequestError) {
  if (error.code === "AZURE_INVALID_ORGANIZATION") {
    return jsonError(
      "Organization must be a valid Azure DevOps organization name.",
      error.code,
      400
    );
  }

  if (error.code === "AZURE_DEVOPS_NETWORK_ERROR") {
    return jsonError(
      "Unable to reach Azure DevOps. Check network access and try again.",
      error.code,
      502
    );
  }

  if (error.status === 401) {
    return jsonError(
      "Azure DevOps rejected the current Microsoft token. Grant Azure DevOps permissions and try again.",
      "AZURE_DEVOPS_UNAUTHORIZED",
      401
    );
  }

  if (error.status === 403) {
    return jsonError(
      "The signed-in Microsoft account does not have access to this Azure DevOps organization.",
      "AZURE_DEVOPS_FORBIDDEN",
      403
    );
  }

  if (error.status === 404) {
    return jsonError(
      "Azure DevOps organization was not found or is not accessible.",
      "AZURE_DEVOPS_ORGANIZATION_NOT_FOUND",
      404
    );
  }

  return jsonError(
    "Unable to configure Azure DevOps.",
    error.code === "AZURE_DEVOPS_INVALID_RESPONSE"
      ? error.code
      : "AZURE_CONFIGURE_FAILED",
    error.status >= 500 ? 502 : error.status || 500
  );
}

async function getOrganizationFromRequest(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const organization = (payload as Record<string, unknown>).organization;

  return typeof organization === "string" ? organization : null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return jsonError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const organizationParam = await getOrganizationFromRequest(request);

  if (!organizationParam) {
    return jsonError(
      "Missing required organization.",
      "AZURE_ORGANIZATION_REQUIRED",
      400
    );
  }

  const organization = normalizeAzureOrganization(organizationParam);

  if (!organization) {
    return jsonError(
      "Organization must be a valid Azure DevOps organization name.",
      "AZURE_INVALID_ORGANIZATION",
      400
    );
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: "azure-ad",
      },
      select: {
        id: true,
      },
    });

    if (!account) {
      return jsonError(
        "No Microsoft account is linked for this session.",
        "AZURE_ACCOUNT_MISSING",
        409
      );
    }

    const { accessToken } = await getValidAzureAccessToken(userId);

    await fetchAzureProjects({
      organization,
      accessToken,
    });

    const now = new Date();
    const existingConnection = await prisma.azureConnection.findFirst({
      where: {
        userId,
        provider: "azure-devops",
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    const connection = existingConnection
      ? await prisma.azureConnection.update({
          where: { id: existingConnection.id },
          data: {
            organizationName: organization,
            organizationUrl: `https://dev.azure.com/${organization}`,
            status: "connected",
            connectedAt: now,
            lastValidatedAt: now,
          },
        })
      : await prisma.azureConnection.create({
          data: {
            userId,
            provider: "azure-devops",
            organizationName: organization,
            organizationUrl: `https://dev.azure.com/${organization}`,
            status: "connected",
            connectedAt: now,
            lastValidatedAt: now,
          },
        });

    const response: AzureConfigureResponse = {
      connection: {
        id: connection.id,
        status: "connected",
        organizationName: connection.organizationName ?? organization,
        organizationUrl:
          connection.organizationUrl ?? `https://dev.azure.com/${organization}`,
        connectedAt: connection.connectedAt?.toISOString() ?? null,
        lastValidatedAt: connection.lastValidatedAt?.toISOString() ?? null,
      },
    };

    return NextResponse.json(response);
  } catch (caughtError) {
    if (caughtError instanceof AzureTokenRefreshError) {
      return jsonError(caughtError.message, caughtError.code, 401);
    }

    if (caughtError instanceof AzureDevOpsRequestError) {
      return getAzureDevOpsErrorResponse(caughtError);
    }

    return jsonError(
      "Unable to configure Azure DevOps.",
      "AZURE_CONFIGURE_FAILED",
      500
    );
  }
}
