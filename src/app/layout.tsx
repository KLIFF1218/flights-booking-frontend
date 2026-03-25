import "./globals.css";
import { AuthInitializer } from "@/components/AuthInitializer";
import { Header } from "@/shared/ui/header/Header";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {/* AuthInitializer must be at root level for hydration */}
        <AuthInitializer />

        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}
