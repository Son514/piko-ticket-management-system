import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/app/server/auth/constants";

export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
