type TransfersTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function formatTransfers(
  count: number,
  t?: TransfersTranslator,
): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("count must be a non-negative integer");
  }

  if (count === 0) {
    return t ? t("transfers.nonStop") : "Non-stop";
  }

  if (count === 1) {
    return t ? t("transfers.oneStop") : "1 stop";
  }

  return t ? t("transfers.manyStops", { count }) : `${count} stops`;
}
