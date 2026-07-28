import type { CurrencyCode } from "@/shared/utils/currency";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";

export function paymentProviderForCurrency(currency: CurrencyCode): PaymentProviderCode {
  return currency === "RUB" ? "YOOKASSA" : "STRIPE";
}

/** Currency required for the selected payment provider. */
export function currencyForPaymentProvider(
  provider: PaymentProviderCode,
  currentCurrency: CurrencyCode,
): CurrencyCode {
  if (provider === "YOOKASSA") {
    return "RUB";
  }

  if (currentCurrency === "RUB") {
    return "USD";
  }

  return currentCurrency;
}

export function isPaymentProviderCurrencyCompatible(
  provider: PaymentProviderCode,
  currency: CurrencyCode,
): boolean {
  if (provider === "YOOKASSA") {
    return currency === "RUB";
  }

  return currency === "USD" || currency === "EUR";
}
