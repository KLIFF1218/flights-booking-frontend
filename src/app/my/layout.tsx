import type { Metadata } from "next";
import styles from "./MyLayout.module.css";

export const metadata: Metadata = {
  title: "Мои заказы — CheapTickets",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className={styles.page}>{children}</main>
    </>
  );
}
