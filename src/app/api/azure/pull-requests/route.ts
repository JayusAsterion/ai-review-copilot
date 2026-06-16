import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  AzureTokenRefreshError,
  getValidAzureAccessToken,
} from "@/lib/auth/oauth-tokens";
import {
  AzureDevOpsRequestError,
  fetchAzurePullRequests,
  normalizeAzureOrganization,
  normalizeAzureProject,
  normalizeAzurePullRequestStatus,
  normalizeAzureRepositoryId,
} from "@/lib/azure-devops";
import type { AzurePullRequestsResponse } from "@/types/azure";

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

  if (error.code === "AZURE_INVALID_PROJECT") {
    return jsonError(
      "Project must be a valid Azure DevOps project name.",
      error.code,
      400
    );
  }

  if (error.code === "AZURE_INVALID_REPOSITORY") {
    return jsonError(
      "Repository id must be a valid Azure DevOps repository id.",
      error.code,
      400
    );
  }

  if (error.code === "AZURE_INVALID_PULL_REQUEST_STATUS") {
    return jsonError(
      "Pull request status must be active, completed, abandoned, or all.",
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
      "Azure DevOps rejected the current Microsoft token. Reconnect or grant Azure DevOps code permissions.",
      "AZURE_DEVOPS_UNAUTHORIZED",
      401
    );
  }

  if (error.status === 403) {
    return jsonError(
      "The signed-in Microsoft account does not have access to this repository.",
      "AZURE_DEVOPS_FORBIDDEN",
      403
    );
  }

  if (error.status === 404) {
    return jsonError(
      "Azure DevOps repository was not found or is not accessible.",
      "AZURE_DEVOPS_REPOSITORY_NOT_FOUND",
      404
    );
  }

  if (error.status >= 500 || error.code === "AZURE_DEVOPS_INVALID_RESPONSE") {
    return jsonError(
      "Unable to load Azure DevOps pull requests.",
      error.code,
      502
    );
  }

  return jsonError(
    "Unable to load Azure DevOps pull requests.",
    "AZURE_PULL_REQUESTS_FAILED",
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
  const projectParam = searchParams.get("project");
  const repositoryIdParam = searchParams.get("repositoryId");
  const statusParam = searchParams.get("status");

  if (!organizationParam) {
    return jsonError(
      "Missing required organization query parameter.",
      "AZURE_ORGANIZATION_REQUIRED",
      400
    );
  }

  if (!projectParam) {
    return jsonError(
      "Missing required project query parameter.",
      "AZURE_PROJECT_REQUIRED",
      400
    );
  }

  if (!repositoryIdParam) {
    return jsonError(
      "Missing required repositoryId query parameter.",
      "AZURE_REPOSITORY_REQUIRED",
      400
    );
  }

  const organization = normalizeAzureOrganization(organizationParam);
  const project = normalizeAzureProject(projectParam);
  const repositoryId = normalizeAzureRepositoryId(repositoryIdParam);
  const status = normalizeAzurePullRequestStatus(statusParam);

  if (!organization) {
    return jsonError(
      "Organization must be a valid Azure DevOps organization name.",
      "AZURE_INVALID_ORGANIZATION",
      400
    );
  }

  if (!project) {
    return jsonError(
      "Project must be a valid Azure DevOps project name.",
      "AZURE_INVALID_PROJECT",
      400
    );
  }

  if (!repositoryId) {
    return jsonError(
      "Repository id must be a valid Azure DevOps repository id.",
      "AZURE_INVALID_REPOSITORY",
      400
    );
  }

  if (!status) {
    return jsonError(
      "Pull request status must be active, completed, abandoned, or all.",
      "AZURE_INVALID_PULL_REQUEST_STATUS",
      400
    );
  }

  try {
    const { accessToken } = await getValidAzureAccessToken(userId);

    const pullRequests = await fetchAzurePullRequests({
      organization,
      project,
      repositoryId,
      accessToken,
      status,
    });

    const response: AzurePullRequestsResponse = {
      organization,
      project,
      repositoryId,
      status,
      count: pullRequests.length,
      pullRequests,
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
      "Unable to load Azure DevOps pull requests.",
      "AZURE_PULL_REQUESTS_FAILED",
      500
    );
  }
}
