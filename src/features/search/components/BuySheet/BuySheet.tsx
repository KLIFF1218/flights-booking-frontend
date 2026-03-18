"use client";

import { Drawer } from "vaul";
import styles from "./BuySheet.module.css";
import { formatDateRange } from "@/shared/utils/formatDate";
import { formatPrice } from "@/shared/utils/formatPrice";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/booking.store";
import type { PricedFlight } from "@/shared/types/flight";
import { initBooking } from "@/features/booking/api/booking.api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: PricedFlight | null;
};

export function BuySheet({ open, onOpenChange, flight }: Props) {
  const router = useRouter();
  const { searchId, offerId } = useBookingStore();

  async function handleBooking() {
    if (!flight) return;

    try {
      const booking = await initBooking(searchId, offerId);

      onOpenChange(false);

      router.push(`/booking/${booking.id}`);
    } catch (err) {
      console.error("Ошибка создания брони", err);
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.content}>
          <Drawer.Handle className={styles.handle} />
          <Drawer.Title className={styles.title}>Покупка билета</Drawer.Title>

          {!flight ? (
            <p className={styles.loading}>Загрузка условий тарифа…</p>
          ) : (
            <>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRoute}>
                  {flight.outbound.from} — {flight.outbound.to}
                </div>

                <div className={styles.summaryMeta}>
                  {formatDateRange(flight)} · {flight.travelers.length} взрослый
                </div>

                <div className={styles.summaryPrice}>
                  {formatPrice(flight.price.total)}{" "}
                  {getCurrencySymbol(flight.price.currency)}
                </div>
              </div>

              <button className={styles.buyButton} onClick={handleBooking}>
                Перейти к оформлению
              </button>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
