"use client";

import Link from "next/link";
import { Heart, User, Globe, Menu } from "lucide-react";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo} aria-label="Главная">
          <span className={styles.logoIcon}>✈️</span>
          <span className={styles.logoText}>CheapTickets</span>
        </Link>

        <nav className={styles.actions}>
          <button aria-label="Профиль" className={styles.iconBtn}>
            <User />
          </button>
          <button aria-label="Избранное" className={styles.iconBtn}>
            <Heart />
          </button>
          <button aria-label="Язык" className={styles.iconBtn}>
            <Globe />
          </button>

          <button aria-label="Меню" className={styles.iconBtn}>
            <Menu />
          </button>
        </nav>
      </div>
    </header>
  );
}
