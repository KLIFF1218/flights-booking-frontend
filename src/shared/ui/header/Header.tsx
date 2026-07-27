"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { usePathMatches } from "@/hooks/useIsMounted";
import { Heart, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "./header.module.css";
import { ProfilePopover } from "./Popover/ProfilePopover";
import { NotificationBell } from "@/features/account/components/NotificationBell";
import { NotificationStreamListener } from "@/features/account/components/NotificationStreamListener";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const isSearch = usePathMatches("/search", pathname);
  const t = useTranslations("header");

  return (
    <header
      className={`${styles.header} ${isSearch ? styles.notFixed : ""} appGradient`}
    >
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo} aria-label={t("homeAria")}>
          <span className={styles.logoIcon}>✈️</span>
          <span className={styles.logoText}>MaxAirline</span>
        </Link>

        <nav className={styles.actions}>
          <NotificationStreamListener />
          <NotificationBell />
          <ProfilePopover />
          <LanguageSwitcher />

          <button aria-label={t("favorites")} className={styles.iconBtn}>
            <Heart />
          </button>

          <button aria-label={t("menu")} className={styles.iconBtn}>
            <Menu />
          </button>
        </nav>
      </div>
    </header>
  );
}
