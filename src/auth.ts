import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import AzureADProvider from "next-auth/providers/azure-ad";

import {
  getPersistableAccount,
  persistEncryptedOAuthTokensForSignIn,
} from "@/lib/auth/oauth-tokens";
import { prisma } from "@/lib/prisma";

function getAzureTenantIdFromIssuer(issuer?: string) {
  if (!issuer) {
    return undefined;
  }

  try {
    const { pathname } = new URL(issuer);
    const [tenantId] = pathname.split("/").filter(Boolean);

    return tenantId;
  } catch {
    return undefined;
  }
}

const azureClientId =
  process.env.AZURE_AD_CLIENT_ID ??
  process.env.AUTH_AZURE_AD_CLIENT_ID ??
  process.env.AUTH_AZURE_AD_ID ??
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID ??
  "";
const azureClientSecret =
  process.env.AZURE_AD_CLIENT_SECRET ??
  process.env.AUTH_AZURE_AD_CLIENT_SECRET ??
  process.env.AUTH_AZURE_AD_SECRET ??
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ??
  "";
const azureTenantId =
  process.env.AZURE_AD_TENANT_ID ??
  process.env.AUTH_AZURE_AD_TENANT_ID ??
  process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ??
  getAzureTenantIdFromIssuer(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ??
      process.env.AUTH_AZURE_AD_ISSUER
  );

function createPrismaAuthAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    linkAccount(account: AdapterAccount) {
      return prisma.account.create({
        data: getPersistableAccount(account),
      });
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: createPrismaAuthAdapter(),
  providers: [
    AzureADProvider({
      clientId: azureClientId,
      clientSecret: azureClientSecret,
      tenantId: azureTenantId,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (user.id) {
        await persistEncryptedOAuthTokensForSignIn(user.id, account);
      }
    },
  },
  pages: {
    signIn: "/",
  },
};
