"use client";

import Link from "next/link";
import { Heart, Globe, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import { ProfilePopover } from "./Popover/ProfilePopover";

export function Header() {
  const pathname = usePathname?.();
  const isSearch = pathname?.startsWith("/search");

  return (
    <header
      className={`${styles.header} ${isSearch ? styles.notFixed : ""} appGradient`}
    >
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo} aria-label="Главная">
          <span className={styles.logoIcon}>✈️</span>
          <span className={styles.logoText}>CheapTickets</span>
        </Link>

        <nav className={styles.actions}>
          <ProfilePopover />

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
