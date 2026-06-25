"use client";

import styles from "./Error.module.css";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>✈️</div>

        <h2 className={styles.title}>Не удалось выполнить поиск рейсов</h2>

        <p className={styles.description}>
          Произошла ошибка при обращении к серверу. Попробуйте выполнить поиск
          снова.
        </p>

        {process.env.NODE_ENV === "development" && (
          <p className={styles.devMessage}>{error.message}</p>
        )}

        <button className={styles.button} onClick={() => router.refresh()}>
          Обновить
        </button>
      </div>
    </section>
  );
}
