import { cacheLife } from "next/cache";
import { connection, NextResponse } from "next/server";
import { loadWarriorsNews } from "@/lib/warriors-news";

async function cachedNews() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 21600 });
  return loadWarriorsNews();
}

export async function GET() {
  await connection();
  try {
    return NextResponse.json(
      { items: await cachedNews() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Warriors news is temporarily unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "Retry-After": "60" },
      },
    );
  }
}
