import { getServerSession } from "next-auth";
import type { ReactNode } from "react";

import { authOptions } from "@/auth";
import { AuthSessionProvider } from "@/components/auth/session-provider";
export async function AuthGate({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <AuthSessionProvider session={session}>{children}</AuthSessionProvider>
  );
}
