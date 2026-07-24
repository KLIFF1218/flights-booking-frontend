import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MaxAirline",
  description: "Search for cheap flights and hotels",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
