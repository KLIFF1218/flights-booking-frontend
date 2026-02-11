import type { Metadata } from "next";
import { Header } from "@/shared/ui/header/Header";
import styles from "./bookingLayout.module.css";

export const metadata: Metadata = {
  title: "Оформление бронирования — CheapTickets",
  description: "Заполнение данных пассажиров и оплата билета",
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
        <div className={styles.container}>{children}</div>
      </main>
    </>
  );
}
