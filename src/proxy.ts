import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getLegacyAdminRedirect,
  isAdminPath,
} from "@/shared/config/admin-routes";
import { sanitizeReturnUrl } from "@/shared/auth/return-url";
import { hasRefreshSessionCookie } from "@/shared/auth/session-cookie";
import { routing } from "@/i18n/routing";
import { getLocaleFromPathname, stripLeadingLocale } from "@/i18n/path";

const handleI18nRouting = createIntlMiddleware(routing);

const AUTH_ROUTE_PREFIXES = ["/my", "/payment", "/booking"] as const;

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return matchesPrefix(pathname, AUTH_ROUTE_PREFIXES);
}

function isProtectedRoute(pathname: string): boolean {
  return isAdminPath(pathname) || isAuthRoute(pathname);
}

function buildLoginPath(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);

  if (locale === routing.defaultLocale) {
    return "/auth/login";
  }

  return `/${locale}/auth/login`;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const loginUrl = new URL(buildLoginPath(pathname), request.url);
  const returnPath = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("returnUrl", returnPath);
  return NextResponse.redirect(loginUrl);
}

function runAuthGuard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = stripLeadingLocale(pathname);

  const legacyRedirect = getLegacyAdminRedirect(pathWithoutLocale);
  if (legacyRedirect) {
    const redirectUrl = new URL(legacyRedirect, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  const cookieHeader = request.headers.get("cookie") ?? undefined;
  const hasSession = hasRefreshSessionCookie(cookieHeader);

  if (pathWithoutLocale.startsWith("/auth/login")) {
    if (!hasSession) {
      return null;
    }

    const returnUrl = request.nextUrl.searchParams.get("returnUrl");
    const destination = sanitizeReturnUrl(returnUrl, pathname);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!isProtectedRoute(pathWithoutLocale)) {
    return null;
  }

  if (!hasSession) {
    return redirectToLogin(request);
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const authResponse = runAuthGuard(request);
    if (authResponse) {
      return authResponse;
    }
    return NextResponse.next();
  }

  const intlResponse = handleI18nRouting(request);

  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  const authResponse = runAuthGuard(request);
  if (authResponse) {
    return authResponse;
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|admin|.*\\..*).*)",
    "/admin",
    "/my",
    "/my/:path*",
    "/admin/:path*",
    "/auth/login",
    "/payment",
    "/payment/:path*",
    "/booking",
    "/booking/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/users",
    "/bookings",
    "/bookings/:path*",
    "/flights",
    "/flights/:path*",
  ],
};
