export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const airlineCode = code.toUpperCase();

  const saveDir = path.join(process.cwd(), "public/airlines");
  const filePath = path.join(saveDir, `${airlineCode}.png`);

  // 1️⃣ если уже есть
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // 2️⃣ если нет — скачиваем
  try {
    const url = `https://images.kiwi.com/airlines/64/${airlineCode}.png`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.redirect(new URL("/airlines/default.png", request.url));
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL("/airlines/default.png", request.url));
  }
}