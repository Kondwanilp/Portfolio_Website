import assert from "node:assert/strict";
import test from "node:test";
import {
  loadWarriorsNews,
  parseWarriorsNews,
  WARRIORS_NEWS_SOURCE,
} from "../lib/warriors-news.ts";

const item = {
  id: 1,
  title: "Team &amp; community update",
  permalink: "https://www.nba.com/warriors/news/team-update",
  timestamp: 1794886471000,
  featuredImage: {
    src: "https://cdn.nba.com/teams/uploads/example.jpg",
    credit: "NBA photographer",
  },
};
const page = (items: unknown[]) =>
  `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { archive: { items } } } })}</script>`;

test("news keeps only verified public metadata, orders publication dates and rejects unsafe source URLs", () => {
  const news = parseWarriorsNews(
    page([
      {
        ...item,
        id: 2,
        title: "Earlier update",
        permalink: item.permalink + "-earlier",
        timestamp: item.timestamp - 100000,
      },
      item,
      item,
      { ...item, permalink: "javascript:alert(1)" },
      {
        ...item,
        permalink: "https://www.nba.com.evil.test/warriors/news/fake",
      },
      {
        ...item,
        permalink: "https://user:password@www.nba.com/warriors/news/fake",
      },
      { ...item, timestamp: NaN },
    ]),
  );
  assert.equal(news.length, 2);
  assert.equal(news[0].title, "Team & community update");
  assert.equal(news[0].imageCredit, "NBA photographer");
  assert.equal(news[0].publishedAt, new Date(item.timestamp).toISOString());
  assert.equal(
    parseWarriorsNews(
      page([
        { ...item, featuredImage: { src: "https://evil.test/image.png" } },
      ]),
    )[0].image,
    null,
  );
});

test("missing or oversized provider markup fails explicitly instead of inventing news", () => {
  for (const value of [
    "<html>unavailable</html>",
    page([]),
    "x".repeat(3000001),
  ])
    assert.throws(() => parseWarriorsNews(value));
});

test("provider requests use a fixed origin, reject redirects and surface transport failures", async () => {
  const news = await loadWarriorsNews(async (url, options) => {
    assert.equal(url, WARRIORS_NEWS_SOURCE);
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal instanceof AbortSignal);
    return new Response(page([item]));
  });
  assert.equal(news.length, 1);
  await assert.rejects(
    loadWarriorsNews(async () => new Response("unavailable", { status: 503 })),
  );
  await assert.rejects(
    loadWarriorsNews(async () => {
      throw new Error("network failure");
    }),
  );
});
