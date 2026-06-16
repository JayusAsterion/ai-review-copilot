import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  AzureTokenRefreshError,
  getValidAzureAccessToken,
} from "@/lib/auth/oauth-tokens";
import {
  AzureDevOpsRequestError,
  fetchAzurePullRequestReviewContext,
  normalizeAzureOrganization,
  normalizeAzureProject,
  normalizeAzurePullRequestId,
  normalizeAzureRepositoryId,
} from "@/lib/azure-devops";

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
      "The signed-in Microsoft account does not have access to this pull request.",
      "AZURE_DEVOPS_FORBIDDEN",
      403
    );
  }

  if (error.status === 404) {
    return jsonError(
      "Azure DevOps pull request was not found or is not accessible.",
      "AZURE_DEVOPS_PULL_REQUEST_NOT_FOUND",
      404
    );
  }

  if (error.status >= 500 || error.code === "AZURE_DEVOPS_INVALID_RESPONSE") {
    return jsonError(
      "Unable to load Azure DevOps pull request context.",
      error.code,
      502
    );
  }

  return jsonError(
    "Unable to load Azure DevOps pull request context.",
    "AZURE_PULL_REQUEST_CONTEXT_FAILED",
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
  const pullRequestIdParam = searchParams.get("pullRequestId");

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

  if (!pullRequestIdParam) {
    return jsonError(
      "Missing required pullRequestId query parameter.",
      "AZURE_PULL_REQUEST_REQUIRED",
      400
    );
  }

  const organization = normalizeAzureOrganization(organizationParam);
  const project = normalizeAzureProject(projectParam);
  const repositoryId = normalizeAzureRepositoryId(repositoryIdParam);
  const pullRequestId = normalizeAzurePullRequestId(pullRequestIdParam);

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

  if (!pullRequestId) {
    return jsonError(
      "Pull request id must be a positive integer.",
      "AZURE_INVALID_PULL_REQUEST",
      400
    );
  }

  try {
    const { accessToken } = await getValidAzureAccessToken(userId);

    const context = await fetchAzurePullRequestReviewContext({
      organization,
      project,
      repositoryId,
      pullRequestId,
      accessToken,
    });

    return NextResponse.json(context);
  } catch (caughtError) {
    if (caughtError instanceof AzureTokenRefreshError) {
      return jsonError(caughtError.message, caughtError.code, 401);
    }

    if (caughtError instanceof AzureDevOpsRequestError) {
      return getAzureDevOpsErrorResponse(caughtError);
    }

    return jsonError(
      "Unable to load Azure DevOps pull request context.",
      "AZURE_PULL_REQUEST_CONTEXT_FAILED",
      500
    );
  }
}
