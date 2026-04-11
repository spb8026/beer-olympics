import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/api/verify-code", "/api/admin-login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const siteAccess = request.cookies.get("site-access");
  if (!siteAccess || siteAccess.value !== "verified") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
