import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type AzureConnectionRow = {
  id: string;
  provider: string;
  organizationName: string | null;
  organizationUrl: string | null;
  tenantId: string | null;
  status: string;
  connectedAt: Date | null;
  lastValidatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AzureSelectionRow = {
  id: string;
  organization: string | null;
  projectId: string | null;
  projectName: string | null;
  repositoryId: string | null;
  repositoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, microsoftAccount, azureConnections, azureSelections] =
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
          provider: true,
          providerAccountId: true,
          expires_at: true,
          token_type: true,
          scope: true,
        },
      }),
      prisma.azureConnection.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          provider: true,
          organizationName: true,
          organizationUrl: true,
          tenantId: true,
          status: true,
          connectedAt: true,
          lastValidatedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.azureSelection.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          organization: true,
          projectId: true,
          projectName: true,
          repositoryId: true,
          repositoryName: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user,
    microsoftAccount: microsoftAccount
      ? {
          provider: microsoftAccount.provider,
          providerAccountId: microsoftAccount.providerAccountId,
          expiresAt: microsoftAccount.expires_at
            ? new Date(microsoftAccount.expires_at * 1000).toISOString()
            : null,
          tokenType: microsoftAccount.token_type,
          scope: microsoftAccount.scope,
        }
      : null,
    azureDevOps: {
      connections: azureConnections.map((connection: AzureConnectionRow) => ({
        ...connection,
        connectedAt: connection.connectedAt?.toISOString() ?? null,
        lastValidatedAt: connection.lastValidatedAt?.toISOString() ?? null,
        createdAt: connection.createdAt.toISOString(),
        updatedAt: connection.updatedAt.toISOString(),
      })),
      selections: azureSelections.map((selection: AzureSelectionRow) => ({
        ...selection,
        createdAt: selection.createdAt.toISOString(),
        updatedAt: selection.updatedAt.toISOString(),
      })),
    },
  });
}
