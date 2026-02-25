"use client";

import React from "react";
import styles from "./OrdersTabs.module.css";

export type TabKey = "active" | "archived";

interface OrdersTabsProps {
  activeCount: number;
  archivedCount: number;
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function OrdersTabs({
  activeCount,
  archivedCount,
  currentTab,
  onTabChange,
}: OrdersTabsProps) {
  return (
    <div className={styles.tabs} role="tablist">
      <button
        role="tab"
        aria-selected={currentTab === "active"}
        className={`${styles.tab} ${
          currentTab === "active" ? styles.active : ""
        }`}
        onClick={() => onTabChange("active")}
      >
        Активные ({activeCount})
      </button>
      <button
        role="tab"
        aria-selected={currentTab === "archived"}
        className={`${styles.tab} ${
          currentTab === "archived" ? styles.active : ""
        }`}
        onClick={() => onTabChange("archived")}
      >
        Архивные ({archivedCount})
      </button>
    </div>
  );
}
