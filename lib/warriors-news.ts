export type WarriorsNewsItem = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  image: string | null;
  imageCredit: string;
};

export const WARRIORS_NEWS_SOURCE =
  "https://www.nba.com/warriors/category/news";

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(amp|quot|apos|nbsp|rsquo|lsquo|ndash|mdash);/g,
      (_, entity: string) =>
        ({
          amp: "&",
          quot: '"',
          apos: "'",
          nbsp: " ",
          rsquo: "’",
          lsquo: "‘",
          ndash: "–",
          mdash: "—",
        })[entity] ?? "",
    )
    .replace(/&#(\d+);/g, (_, value: string) => {
      const code = Number(value);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .trim();
}

function sourceUrl(value: unknown, image = false): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    if (image)
      return url.hostname === "cdn.nba.com" &&
        url.pathname.startsWith("/teams/uploads/")
        ? url.href
        : null;
    return ["www.nba.com", "nba.com"].includes(url.hostname) &&
      url.pathname.startsWith("/warriors/news/")
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Only public headline metadata is retained. Article HTML is never rendered. */
export function parseWarriorsNews(html: string): WarriorsNewsItem[] {
  if (html.length > 3_000_000) throw new Error("News response too large");
  const script = html.match(
    /<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  )?.[1];
  if (!script) throw new Error("News metadata unavailable");
  const data = JSON.parse(script);
  const items: unknown = data?.props?.pageProps?.archive?.items;
  if (!Array.isArray(items)) throw new Error("News archive unavailable");
  const news: WarriorsNewsItem[] = [];
  const seen = new Set<string>();
  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;
    const url = sourceUrl(entry.permalink);
    const timestamp = entry.timestamp;
    if (
      !url ||
      seen.has(url) ||
      typeof entry.title !== "string" ||
      typeof timestamp !== "number" ||
      !Number.isFinite(timestamp) ||
      timestamp < 946684800000 ||
      timestamp > 4102444800000
    )
      continue;
    const title = plainText(entry.title).slice(0, 300);
    if (!title) continue;
    seen.add(url);
    news.push({
      id: String(entry.id ?? url),
      title,
      url,
      publishedAt: new Date(timestamp).toISOString(),
      image: sourceUrl(entry.featuredImage?.src, true),
      imageCredit:
        typeof entry.featuredImage?.credit === "string"
          ? plainText(entry.featuredImage.credit).slice(0, 200)
          : "",
    });
  }
  if (!news.length) throw new Error("No verified news metadata");
  return news
    .sort((first, second) =>
      second.publishedAt.localeCompare(first.publishedAt),
    )
    .slice(0, 8);
}

export async function loadWarriorsNews(fetcher: typeof fetch = fetch) {
  const response = await fetcher(WARRIORS_NEWS_SOURCE, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(8000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("News provider unavailable");
  return parseWarriorsNews(await response.text());
}
