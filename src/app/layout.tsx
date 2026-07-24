import '@/app/globals.css';

import { AuthInitializer } from "@/components/AuthInitializer";
import { AuthCookieBootstrap } from "@/components/AuthCookieBootstrap";
import { CurrencyInitializer } from "@/components/CurrencyInitializer";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { SiteShell } from "@/components/SiteShell";
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthCookieBootstrap />
          <AuthInitializer />
          <CurrencyInitializer />
          <ThemeInitializer />

          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
