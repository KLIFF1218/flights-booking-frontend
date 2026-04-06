"use client";

import { useRouter, usePathname } from "next/navigation";
import { Settings, Bell, FileText, Package } from "lucide-react";

export function ProfileSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      label: "Настройки",
      icon: Settings,
      href: "/my/settings",
    },
    {
      label: "Уведомления",
      icon: Bell,
      href: "/my/notifications",
    },
    {
      label: "Мои заказы",
      icon: Package,
      href: "/my/orders",
    },
    {
      label: "Документы",
      icon: FileText,
      href: "/my/documents",
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6 flex-shrink-0">
      <nav className="flex lg:flex-col gap-1 sm:gap-2 overflow-x-auto lg:overflow-x-visible">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}