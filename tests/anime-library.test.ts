import assert from "node:assert/strict";
import test from "node:test";
import { animeReviews } from "../lib/anime-library.ts";
import { sendAnimeRecommendation } from "../lib/anime-recommendation.ts";

test("all supplied anime retain half ratings, watching states, stable ties and unrated entries last", () => {
  assert.equal(animeReviews.length, 28);
  assert.equal(new Set(animeReviews.map((anime) => anime.id)).size, 28);
  assert.deepEqual(
    animeReviews.filter((anime) => anime.rating === 5).map((anime) => anime.id),
    [
      "attack-on-titan",
      "death-note",
      "fullmetal-alchemist",
      "monster",
      "berserk",
      "vinland-saga",
    ],
  );
  for (let index = 1; index < animeReviews.length; index++) {
    assert.ok(
      (animeReviews[index - 1].rating ?? -1) >=
        (animeReviews[index].rating ?? -1),
    );
  }
  assert.deepEqual(
    animeReviews.slice(-3).map((anime) => anime.id),
    ["my-home-hero", "hunter-x-hunter", "spirited-away"],
  );
  assert.equal(
    animeReviews.find((anime) => anime.id === "bleach")?.rating,
    4.5,
  );
  assert.equal(
    animeReviews.find((anime) => anime.id === "one-piece")?.status,
    "watching",
  );
  assert.ok(
    animeReviews
      .filter((anime) => anime.status === "planned")
      .every((anime) => anime.rating === null && anime.review === ""),
  );
});

test("recommendations send only the bounded message, form ID and spam flag to the fixed provider", async () => {
  const signal = new AbortController().signal;
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.web3forms.com/submit");
    assert.equal(options?.method, "POST");
    assert.equal(options?.signal, signal);
    const body = JSON.parse(options?.body as string);
    assert.equal(body.access_key, "public-test-form");
    assert.equal(body.message, "Watch <a show> & enjoy it");
    assert.equal(body.botcheck, false);
    assert.equal(body.email, undefined);
    return Response.json({ success: true });
  };
  await sendAnimeRecommendation(
    "public-test-form",
    "  Watch <a show> & enjoy it  ",
    false,
    signal,
    fetcher,
  );
});

test("provider rejection, malformed JSON, rate limiting and cancellation cannot report successful delivery", async () => {
  const signal = new AbortController().signal;
  for (const response of [
    Response.json({ success: false }),
    Response.json({ success: "true" }),
    Response.json({ success: true }, { status: 429 }),
    new Response("not JSON", { status: 503 }),
  ]) {
    await assert.rejects(
      sendAnimeRecommendation(
        "public-test-form",
        "A show",
        false,
        signal,
        async () => response,
      ),
    );
  }
  await assert.rejects(
    sendAnimeRecommendation(
      "public-test-form",
      "A show",
      false,
      signal,
      async () => {
        throw new DOMException("Aborted", "AbortError");
      },
    ),
  );
});

test("invalid recommendations are rejected before any provider request", async () => {
  let requested = false;
  const fetcher: typeof fetch = async () => {
    requested = true;
    return Response.json({ success: true });
  };
  for (const [key, message] of [
    ["", "A show"],
    ["public-test-form", "   "],
    ["public-test-form", "x".repeat(1001)],
  ]) {
    await assert.rejects(
      sendAnimeRecommendation(
        key,
        message,
        false,
        new AbortController().signal,
        fetcher,
      ),
    );
  }
  assert.equal(requested, false);
});
