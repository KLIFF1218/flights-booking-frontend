import type { Metadata } from "next";
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
      <main>{children}</main>
    </>
  );
}
