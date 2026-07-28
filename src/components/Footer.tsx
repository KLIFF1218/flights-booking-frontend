"use client";

import { Link } from "@/i18n/navigation";
import { Plane } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("home.footer");

  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300 px-4 pt-16 pb-10">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl"
        aria-hidden
      />

      <div className="container relative mx-auto max-w-3xl text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 mb-6 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-105">
            <Plane className="h-6 w-6 text-white -rotate-45" />
          </div>
          <span className="text-2xl font-semibold text-white tracking-tight">
            MaxAirline
          </span>
        </Link>

        <p className="text-base leading-relaxed text-gray-400 max-w-xl mx-auto">
          {t("description")}
        </p>

        <div
          className="mx-auto mt-10 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          aria-hidden
        />

        <p className="mt-8 text-sm text-gray-500">{t("copyright")}</p>
      </div>
    </footer>
  );
}
