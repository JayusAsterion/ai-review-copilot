import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  normalizeAzureOrganization,
  normalizeAzureProject,
  normalizeAzureRepositoryId,
} from "@/lib/azure-devops";
import { prisma } from "@/lib/prisma";
import type { AzureSelectionResponse } from "@/types/azure";

function jsonError(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

function stringFromPayload(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return jsonError("Unauthorized", "UNAUTHORIZED", 401);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid request body.", "AZURE_INVALID_BODY", 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonError("Invalid request body.", "AZURE_INVALID_BODY", 400);
  }

  const body = payload as Record<string, unknown>;
  const organization = normalizeAzureOrganization(
    stringFromPayload(body, "organization") ?? ""
  );
  const projectId = stringFromPayload(body, "projectId")?.trim() ?? "";
  const projectName = normalizeAzureProject(
    stringFromPayload(body, "projectName") ?? ""
  );
  const repositoryId = normalizeAzureRepositoryId(
    stringFromPayload(body, "repositoryId") ?? ""
  );
  const repositoryName =
    stringFromPayload(body, "repositoryName")?.trim() ?? "";

  if (!organization) {
    return jsonError(
      "Organization must be a valid Azure DevOps organization name.",
      "AZURE_INVALID_ORGANIZATION",
      400
    );
  }

  if (!projectId || !projectName) {
    return jsonError(
      "Project id and project name are required.",
      "AZURE_PROJECT_REQUIRED",
      400
    );
  }

  if (!repositoryId || !repositoryName) {
    return jsonError(
      "Repository id and repository name are required.",
      "AZURE_REPOSITORY_REQUIRED",
      400
    );
  }

  const connection = await prisma.azureConnection.findFirst({
    where: {
      userId,
      provider: "azure-devops",
      organizationName: organization,
      status: "connected",
    },
    select: {
      id: true,
    },
  });

  if (!connection) {
    return jsonError(
      "Configure this Azure DevOps organization before saving a selection.",
      "AZURE_CONNECTION_REQUIRED",
      409
    );
  }

  const existingSelection = await prisma.azureSelection.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  const selection = existingSelection
    ? await prisma.azureSelection.update({
        where: { id: existingSelection.id },
        data: {
          organization,
          projectId,
          projectName,
          repositoryId,
          repositoryName,
        },
      })
    : await prisma.azureSelection.create({
        data: {
          userId,
          organization,
          projectId,
          projectName,
          repositoryId,
          repositoryName,
        },
      });

  const response: AzureSelectionResponse = {
    selection: {
      id: selection.id,
      organization: selection.organization ?? organization,
      projectId: selection.projectId ?? projectId,
      projectName: selection.projectName ?? projectName,
      repositoryId: selection.repositoryId ?? repositoryId,
      repositoryName: selection.repositoryName ?? repositoryName,
      updatedAt: selection.updatedAt.toISOString(),
    },
  };

  return NextResponse.json(response);
}
