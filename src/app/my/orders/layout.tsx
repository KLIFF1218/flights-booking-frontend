import type { Metadata } from "next";
import { Header } from "@/shared/ui/header/Header";
import styles from "./ordersLayout.module.css";

export const metadata: Metadata = {
  title: "Мои заказы — CheapTickets",
  description: "Список ваших бронирований и заказов",
};

export default function OrdersLayout({
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
