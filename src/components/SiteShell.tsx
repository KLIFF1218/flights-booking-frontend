"use client";

import type { ReactNode } from "react";
import { Header } from "@/shared/ui/header/Header";
import { isAdminPath } from "@/shared/config/admin-routes";
import { usePathname } from "@/i18n/navigation";
import { usePathMatches } from "@/hooks/useIsMounted";

const SITE_HEADER_HEIGHT_PX = 72;

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const needsHeaderOffset = usePathMatches("/my", pathname);

  if (isAdminPath(pathname)) {
    return children;
  }

  return (
    <>
      <Header />
      <main
        style={
          needsHeaderOffset
            ? { paddingTop: `${SITE_HEADER_HEIGHT_PX}px` }
            : undefined
        }
      >
        {children}
      </main>
    </>
  );
}
