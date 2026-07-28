/** Human-readable device label from a browser User-Agent string. */
export function formatDeviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent?.trim()) return "Unknown device";

  const ua = userAgent.toLowerCase();

  let os = "Unknown OS";
  if (/iphone|ipad|ipod/.test(ua)) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("cros")) os = "ChromeOS";
  else if (ua.includes("linux")) os = "Linux";

  let browser = "Unknown browser";
  if (ua.includes("edg/") || ua.includes("edgios/") || ua.includes("edga/")) {
    browser = "Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("firefox/") || ua.includes("fxios/")) {
    browser = "Firefox";
  } else if (ua.includes("chrome/") || ua.includes("crios/")) {
    browser = "Chrome";
  } else if (ua.includes("safari/") && !ua.includes("chrome") && !ua.includes("crios")) {
    browser = "Safari";
  }

  return `${browser} on ${os}`;
}

/** Hide Docker/LAN gateway noise in local/dev; show public IPs as-is. */
export function formatSessionIp(ip: string | null | undefined): string {
  if (!ip?.trim()) return "Unknown IP";

  const value = ip.trim();
  if (
    value === "127.0.0.1" ||
    value === "::1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  ) {
    return "Local network";
  }

  return value;
}
