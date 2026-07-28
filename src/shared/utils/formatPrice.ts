export function formatPrice(price: number, locale = "en") {
  const formatLocale = locale === "ru" ? "ru-RU" : "en-US";

  return Number(price).toLocaleString(formatLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

