"use client";

import { useEffect, useState } from "react";

export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
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
