import type { Metadata } from "next";
import { Header } from "@/shared/ui/header/Header";
import { BookingAuthGuard } from "@/features/booking/components/BookingAuthGuard/BookingAuthGuard";
import styles from "./bookingLayout.module.css";

export const metadata: Metadata = {
  title: "Booking checkout — MaxAirline",
  description: "Enter passenger details and pay for your ticket",
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <BookingAuthGuard>{children}</BookingAuthGuard>
        </div>
      </main>
    </>
  );
}
