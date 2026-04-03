import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AirBooking Admin Dashboard",
  description: "Панель администрирования для сайта бронирования авиабилетов",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <> {children}</>;
}
