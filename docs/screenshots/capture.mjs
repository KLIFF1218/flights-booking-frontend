import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = "http://localhost";
const EMAIL = "demo@maxairline.local";
const PASSWORD = "Demo1234!";

const DATE = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
})();

async function go(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function shot(page, name, fullPage = false) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage });
  console.log("saved", name);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Landing
  await go(page, `${BASE}/`);
  await shot(page, "01-landing.png");

  // Login form
  await go(page, `${BASE}/auth/login`);
  await shot(page, "02-login.png");

  // Search results
  const searchUrl = `${BASE}/search?from=JFK&to=SFO&dateFrom=${DATE}&adults=1&travelClass=ECONOMY#search-results`;
  await go(page, searchUrl);
  await page.waitForSelector("text=Select flight", { timeout: 25000 }).catch(() => null);
  await page.waitForTimeout(800);
  await shot(page, "03-search.png");

  // Login via UI
  await go(page, `${BASE}/auth/login`);
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(2500);

  // Account orders
  await go(page, `${BASE}/my/orders`);
  await shot(page, "05-my-orders.png");

  // Documents
  await go(page, `${BASE}/my/documents`);
  await shot(page, "06-my-documents.png");

  // Settings / dark theme area
  await go(page, `${BASE}/my/settings`);
  await shot(page, "07-my-settings.png");

  // Admin dashboard (user must be ADMIN)
  await go(page, `${BASE}/admin/dashboard`);
  await page.waitForTimeout(1000);
  await shot(page, "08-admin-dashboard.png");

  await go(page, `${BASE}/admin/flights`);
  await shot(page, "09-admin-flights.png");

  await go(page, `${BASE}/admin/bookings`);
  await shot(page, "10-admin-bookings.png");

  // Open BuySheet from search if possible
  await go(page, searchUrl);
  const select = page.locator("text=Select flight").first();
  if (await select.count()) {
    await select.click({ force: true });
    await page.waitForTimeout(1800);
    await shot(page, "04-buy-sheet.png");
  }

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
