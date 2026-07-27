import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MaxAirline Admin Dashboard",
  description: "Admin panel for MaxAirline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <> {children}</>;
}
