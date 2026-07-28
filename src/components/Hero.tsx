"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { HeroSearch } from "@/features/search/components/HeroSearch/HeroSearch";

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative pt-34 pb-18 px-4 ">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-sky-400 to-indigo-500 -z-10"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10"></div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-5">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            {t("title")}
            <span className="block mt-2 bg-gradient-to-r from-blue-100 to-purple-100 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="h-40 rounded-2xl bg-white/20 animate-pulse" />
          }
        >
          <HeroSearch />
        </Suspense>
      </div>
    </section>
  );
}
