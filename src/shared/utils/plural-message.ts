export function pluralMessageKey(
  baseKey: string,
  count: number,
  locale: string,
): string {
  const rule = new Intl.PluralRules(locale).select(count);

  if (rule === "one") {
    return `${baseKey}_one`;
  }

  if (locale.startsWith("ru")) {
    if (rule === "few") {
      return `${baseKey}_few`;
    }

    return `${baseKey}_many`;
  }

  return `${baseKey}_other`;
}
