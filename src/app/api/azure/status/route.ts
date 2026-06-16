import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  AzureTokenRefreshError,
  getValidAzureAccessToken,
} from "@/lib/auth/oauth-tokens";
import { getAzureStatusForUser } from "@/lib/azure/status";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getValidAzureAccessToken(userId);
    const status = await getAzureStatusForUser(userId);

    if (!status) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (caughtError) {
    if (caughtError instanceof AzureTokenRefreshError) {
      return NextResponse.json(
        { error: caughtError.message, code: caughtError.code },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load Azure status" },
      { status: 500 }
    );
  }
}
