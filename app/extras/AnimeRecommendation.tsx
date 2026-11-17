"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendAnimeRecommendation } from "@/lib/anime-recommendation";

export default function AnimeRecommendation() {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
  const [recommendation, setRecommendation] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "error" | "invalid"
  >("idle");
  const request = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      const controller = request.current;
      request.current = null;
      controller?.abort();
    },
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = recommendation.trim();
    if (request.current) return;
    if (!text || text.length > 1000) {
      setState("invalid");
      return;
    }
    if (!accessKey) {
      window.location.href = `mailto:kondwanilphiri2023@gmail.com?subject=${encodeURIComponent("An anime recommendation")}&body=${encodeURIComponent(text)}`;
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    setState("sending");
    try {
      const form = new FormData(event.currentTarget);
      await sendAnimeRecommendation(
        accessKey,
        text,
        form.has("botcheck"),
        controller.signal,
      );
      if (request.current !== controller) return;
      setState("success");
      setRecommendation("");
    } catch {
      // Keep the message intact and let the visitor explicitly retry.
      if (request.current === controller) setState("error");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <form
      className="anime-recommendation"
      onSubmit={submit}
      aria-busy={state === "sending"}
    >
      <h3>What should I watch next?</h3>
      <label htmlFor="anime-recommendation">Your recommendation</label>
      <textarea
        id="anime-recommendation"
        name="message"
        required
        maxLength={1000}
        value={recommendation}
        disabled={state === "sending"}
        onChange={(event) => {
          setRecommendation(event.target.value);
          setState("idle");
        }}
        placeholder="The show, and why you liked it…"
      />
      <input
        type="checkbox"
        name="botcheck"
        className="anime-botcheck"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button type="submit" disabled={state === "sending"}>
        {state === "sending"
          ? "Sending…"
          : accessKey
            ? "Send recommendation"
            : "Recommend by email"}
      </button>
      <p className="mood-small">
        {accessKey
          ? "Recommendations are sent through Web3Forms."
          : "Opens your email app. Send the message there to share it with me."}
      </p>
      {state === "success" && (
        <p role="status">Recommendation sent. Thanks for the suggestion!</p>
      )}
      {state === "invalid" && (
        <p role="alert">Add a recommendation of up to 1,000 characters.</p>
      )}
      {state === "error" && (
        <p role="alert">
          Delivery couldn’t be confirmed. Your message is still here. Try again,
          or{" "}
          <a
            href={`mailto:kondwanilphiri2023@gmail.com?subject=${encodeURIComponent("An anime recommendation")}&body=${encodeURIComponent(recommendation.trim())}`}
          >
            send it by email
          </a>
          .
        </p>
      )}
    </form>
  );
}
