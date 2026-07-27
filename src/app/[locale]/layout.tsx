import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthInitializer } from "@/components/AuthInitializer";
import { AuthCookieBootstrap } from "@/components/AuthCookieBootstrap";
import { CurrencyInitializer } from "@/components/CurrencyInitializer";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { SiteShell } from "@/components/SiteShell";
import { LocaleHtmlLang } from "@/components/LocaleHtmlLang";
import { QueryProvider } from "@/providers/QueryProvider";
import { routing, type AppLocale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlLang />
      <QueryProvider>
        <AuthCookieBootstrap />
        <AuthInitializer />
        <CurrencyInitializer />
        <ThemeInitializer />

        <SiteShell>{children}</SiteShell>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
