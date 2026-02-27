"use client";

import { useState } from "react";
import styles from "./orders.module.css";
import { ProfileSidebar } from "@/components/Orders/ProfileSidebar";
import {
  useUserBookings,
  filterActiveBookings,
  filterArchivedBookings,
} from "@/hooks/useUserBookings";
import { BookingListDisplay } from "@/components/UserBookingsList";

type TabKey = "active" | "archived";

export default function OrdersPage() {
  const [tab, setTab] = useState<TabKey>("active");
  const { bookings, loading, error } = useUserBookings();

  const activeOrders = filterActiveBookings(bookings);
  const archivedOrders = filterArchivedBookings(bookings);

  return (
    <div className={styles.wrapper}>
      <ProfileSidebar />

      <div className={styles.content}>
        <h1 className={styles.title}>Мои заказы</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              tab === "active" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("active")}
          >
            Активные ({activeOrders.length})
          </button>
          <button
            className={`${styles.tab} ${
              tab === "archived" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("archived")}
          >
            Архив ({archivedOrders.length})
          </button>
        </div>

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: "red" }}>Ошибка: {error.message}</p>}

        {!loading && tab === "active" && (
          <>
            {activeOrders.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.eyes}>👀</div>
                <h2>Пока нет активных заказов</h2>
                <p>
                  Но скоро наверняка появятся! Если вы уже сделали заказ, а его
                  здесь нет, подождите немного — он сам загрузится в течение 2
                  дней после покупки
                </p>
              </div>
            ) : (
              <BookingListDisplay bookings={activeOrders} />
            )}
          </>
        )}

        {!loading && tab === "archived" && (
          <>
            {archivedOrders.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.eyes}>👀</div>
                <h2>Архив пуст</h2>
              </div>
            ) : (
              <BookingListDisplay bookings={archivedOrders} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
