import assert from "node:assert/strict";
import test from "node:test";
import { comicIndex, comicReviews, comicSwipeDirection, extrasActivityFromHash } from "../lib/comic-omics.ts";

test("comic navigation wraps in either direction and handles an empty shelf", () => {
  assert.equal(comicIndex(0, -1, 3), 2);
  assert.equal(comicIndex(2, 1, 3), 0);
  assert.equal(comicIndex(1, 10, 3), 2);
  assert.equal(comicIndex(NaN, Infinity, 3), 0);
  for (const count of [0, -1, NaN, Infinity]) assert.equal(comicIndex(1, 1, count), 0);
});

test("a deliberate drag or short fast fling changes covers while taps and vertical-scroll jitter do not", () => {
  assert.equal(comicSwipeDirection(4, 30), 0);
  assert.equal(comicSwipeDirection(20, 200), 0);
  assert.equal(comicSwipeDirection(-90, 600), 1);
  assert.equal(comicSwipeDirection(90, 600), -1);
  assert.equal(comicSwipeDirection(-18, 24), 1);
  assert.equal(comicSwipeDirection(90, 0), 0);
  assert.equal(comicSwipeDirection(Infinity, 20), 0);
});

test("only supported activities open by fragment and the owner's supplied reviews retain their ratings", () => {
  assert.equal(extrasActivityFromHash("#anime"), "anime");
  assert.equal(extrasActivityFromHash("#chess"), "chess");
  assert.equal(extrasActivityFromHash("#basketball"), "basketball");
  for (const hash of ["", "#listening", "#comic-omics-title", "#studio", "#<script>"]) assert.equal(extrasActivityFromHash(hash), null);
  assert.equal(new Set(comicReviews.map(comic => comic.id)).size, comicReviews.length);
  assert.deepEqual(comicReviews.map(comic => comic.rating), [3, 5, 5]);
  assert.ok(comicReviews.every(comic => !comic.placeholder && comic.review && comic.cover?.startsWith("/comics/")));
  assert.equal(comicReviews.find(comic => comic.id === "thor-god-of-thunder")?.additionalCovers?.length, 1);
  for (const comic of comicReviews.filter(comic => comic.placeholder)) {
    assert.equal(comic.review, undefined);
    assert.equal(comic.rating, undefined);
    assert.equal(comic.cover, undefined);
  }
});


test("annotation revisions keep reviews visible and remove redundant comic actions", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/extras/ComicOmics.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /<details|Read my review|View cover|Book details|Play rotation|Pause rotation/);
  assert.match(source, /setInterval/);
  assert.match(source, /prefers-reduced-motion/);
  assert.ok(comicReviews.find(comic => comic.id === "marvel-zombies")?.review?.includes("thats twist"));
});


test("travel geography uses finite world coordinates and the anime form has an honest email handoff", async () => {
  const { readFile } = await import("node:fs/promises");
  const coastlines = JSON.parse(await readFile(new URL("../lib/travel-coastlines.json", import.meta.url), "utf8")) as number[][][];
  assert.ok(coastlines.length > 100);
  for (const ring of coastlines) for (const [lon, lat] of ring) {
    assert.ok(Number.isFinite(lon) && Math.abs(lon) <= 180);
    assert.ok(Number.isFinite(lat) && Math.abs(lat) <= 90);
  }
  const anime = await readFile(new URL("../app/extras/AnimeRecommendation.tsx", import.meta.url), "utf8");
  assert.match(anime, /mailto:kondwanilphiri2023@gmail.com/);
  assert.match(anime, /encodeURIComponent\(text\)/);
  assert.match(anime, /maxLength=\{1000\}/);
  assert.match(anime, /Opens your email app/);
});
