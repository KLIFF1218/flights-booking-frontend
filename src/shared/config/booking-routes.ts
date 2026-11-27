export function isBookingCheckoutPath(pathname: string): boolean {
  return pathname === "/booking" || pathname.startsWith("/booking/");
}

export function isPaymentCheckoutPath(pathname: string): boolean {
  return pathname === "/payment" || pathname.startsWith("/payment/");
}

export function isRealtimeNotificationPath(pathname: string): boolean {
  return !isBookingCheckoutPath(pathname) && !isPaymentCheckoutPath(pathname);
}
