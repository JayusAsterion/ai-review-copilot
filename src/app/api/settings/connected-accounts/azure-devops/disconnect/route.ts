import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.azureSelection.deleteMany({
      where: { userId },
    }),
    prisma.azureConnection.deleteMany({
      where: { userId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
