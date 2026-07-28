"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function usePathMatches(prefix: string, pathname: string) {
  const mounted = useIsMounted();

  if (!mounted) {
    return false;
  }

  return matchesPath(pathname, prefix);
}
