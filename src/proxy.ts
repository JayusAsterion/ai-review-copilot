import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const sessionCookieNames = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

export default async function proxy(request: NextRequest) {
  const sessionToken = sessionCookieNames
    .map((name) => request.cookies.get(name)?.value)
    .find(Boolean);

  if (!sessionToken) {
    return redirectToSignIn(request);
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
    select: {
      expires: true,
    },
  });

  if (!session || session.expires < new Date()) {
    return redirectToSignIn(request);
  }

  return NextResponse.next();
}

function redirectToSignIn(request: NextRequest) {
  const url = request.nextUrl.clone();
  const callbackUrl = `${url.pathname}${url.search}`;

  url.pathname = "/";
  url.search = "";
  url.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/review/:path*",
    "/bug-report/:path*",
    "/test-cases/:path*",
    "/settings/:path*",
    "/guide/:path*",
    "/history/:path*",
  ],
};
