export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { normalizeAirlineCode } from "@/shared/utils/airline-logo";

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=31536000, immutable",
} as const;

const AIRLINES_DIR = path.join(process.cwd(), "public/airlines");
const DEFAULT_LOGO_PATH = path.join(AIRLINES_DIR, "default.png");

function kiwiLogoUrl(code: string): string {
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

async function readLogoFile(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

function servePng(buffer: Buffer): NextResponse {
  return new NextResponse(new Uint8Array(buffer), { headers: PNG_HEADERS });
}

async function serveDefaultLogo(): Promise<NextResponse> {
  const buffer = await readLogoFile(DEFAULT_LOGO_PATH);

  if (!buffer) {
    return new NextResponse(null, { status: 404 });
  }

  return servePng(buffer);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const airlineCode = normalizeAirlineCode(code);

  if (!airlineCode) {
    return serveDefaultLogo();
  }

  const filePath = path.join(AIRLINES_DIR, `${airlineCode}.png`);
  const cached = await readLogoFile(filePath);

  if (cached) {
    return servePng(cached);
  }

  try {
    const response = await fetch(kiwiLogoUrl(airlineCode));

    if (!response.ok) {
      return serveDefaultLogo();
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    try {
      await fs.mkdir(AIRLINES_DIR, { recursive: true });
      await fs.writeFile(filePath, buffer);
    } catch {
      // Ignore cache write failures on read-only filesystems.
    }

    return servePng(buffer);
  } catch {
    return serveDefaultLogo();
  }
}
