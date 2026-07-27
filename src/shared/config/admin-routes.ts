export const ADMIN_ROUTE_PREFIX = "/admin";

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_ROUTE_PREFIX ||
    pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
  );
}

export function getLegacyAdminRedirect(pathname: string): string | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return `/admin${pathname}`;
  }

  if (pathname === "/users") {
    return "/admin/users";
  }

  if (pathname === "/bookings" || pathname.startsWith("/bookings/")) {
    return `/admin${pathname}`;
  }

  if (pathname === "/flights" || pathname.startsWith("/flights/")) {
    return `/admin${pathname}`;
  }

  return null;
}
