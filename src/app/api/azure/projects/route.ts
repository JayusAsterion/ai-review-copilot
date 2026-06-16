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
import type { AzureProjectsResponse } from "@/types/azure";

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
      "Azure DevOps rejected the current Microsoft token. Reconnect or grant Azure DevOps permissions.",
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

  if (error.status >= 500 || error.code === "AZURE_DEVOPS_INVALID_RESPONSE") {
    return jsonError(
      "Unable to load Azure DevOps projects.",
      error.code,
      502
    );
  }

  return jsonError(
    "Unable to load Azure DevOps projects.",
    "AZURE_PROJECTS_FAILED",
    error.status || 500
  );
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return jsonError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { searchParams } = new URL(request.url);
  const organizationParam = searchParams.get("organization");

  if (!organizationParam) {
    return jsonError(
      "Missing required organization query parameter.",
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
    const { accessToken } = await getValidAzureAccessToken(userId);

    const projects = await fetchAzureProjects({
      organization,
      accessToken,
    });

    const response: AzureProjectsResponse = {
      organization,
      count: projects.length,
      projects,
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
      "Unable to load Azure DevOps projects.",
      "AZURE_PROJECTS_FAILED",
      500
    );
  }
}
