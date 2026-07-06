import '@/app/globals.css';

import { AuthInitializer } from "@/components/AuthInitializer";
import { CurrencyInitializer } from "@/components/CurrencyInitializer";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { Header } from "@/shared/ui/header/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthInitializer />
        <CurrencyInitializer />
        <ThemeInitializer />

        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}
