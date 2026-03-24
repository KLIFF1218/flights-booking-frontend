export function getCurrencySymbol(
  currency: string,
  locale = "en-US",
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });

  const parts = formatter.formatToParts(1);
  const symbol = parts.find((p) => p.type === "currency")?.value;

  return symbol ?? currency;
}

