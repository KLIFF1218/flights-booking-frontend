import type { Metadata } from "next";
import { Header } from "@/shared/ui/header/Header";
import "../globals.css";
import { HeroSearch } from "@/features/search/components/HeroSearch/HeroSearch";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CheapTickets",
  description: "Поиск дешёвых авиабилетов и отелей",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <HeroSearch />
      </Suspense>
      <main>{children}</main>
    </>
  );
}
