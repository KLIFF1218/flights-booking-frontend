
export const metadata = {
  title: "CheapTickets - Flight Booking",
  description: "Find and book cheap flights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white text-gray-800">{children}</div>;
}
