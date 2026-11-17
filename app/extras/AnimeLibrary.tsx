"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { animeReviews, animeStatusLabels } from "@/lib/anime-library";
import { comicIndex, comicSwipeDirection } from "@/lib/comic-omics";
import AnimeRecommendation from "./AnimeRecommendation";
import "./anime-library.css";

export default function AnimeLibrary() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; time: number } | null>(null);
  const suppressClick = useRef(false);
  const focusNextPoster = useRef(false);
  const current = animeReviews[active];

  useLayoutEffect(() => {
    if (!focusNextPoster.current) return;
    root.current
      ?.querySelector<HTMLButtonElement>('.anime-poster[tabindex="0"]')
      ?.focus({ preventScroll: true });
    focusNextPoster.current = false;
  }, [active]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover)");
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    const timer = window.setInterval(() => {
      const element = root.current;
      if (
        !visible ||
        !element ||
        motion.matches ||
        document.hidden ||
        drag.current
      )
        return;
      if (
        element.contains(document.activeElement) ||
        (hover.matches && element.matches(":hover"))
      )
        return;
      setActive((index) => comicIndex(index, 1, animeReviews.length));
    }, 9000);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  function turn(direction: number) {
    focusNextPoster.current =
      document.activeElement instanceof HTMLElement &&
      document.activeElement.classList.contains("anime-poster");
    setActive((index) => comicIndex(index, direction, animeReviews.length));
  }

  return (
    <section className="anime-library" ref={root} aria-labelledby="anime-title">
      <header className="anime-heading">
        <div>
          <p className="section-label">After the credits</p>
          <h2 id="anime-title">Anime.</h2>
        </div>
        <p className="mood-small">
          Highest rated first · {animeReviews.length} shows
        </p>
      </header>
      <div
        className="anime-carousel"
        aria-roledescription="carousel"
        aria-label="My anime reviews"
        onKeyDown={(event) => {
          if (
            !(event.target instanceof HTMLElement) ||
            event.target.closest("select, input, textarea")
          )
            return;
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            turn(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div className="anime-stage">
          {animeReviews.map((anime, index) => {
            const slot = comicIndex(index, -active, animeReviews.length);
            return (
              <button
                type="button"
                key={anime.id}
                hidden={slot > 2}
                className="anime-poster"
                style={{ "--slot": slot, zIndex: 3 - slot } as CSSProperties}
                tabIndex={slot === 0 ? 0 : -1}
                aria-hidden={slot !== 0}
                aria-label={`${anime.title} poster. Show next review.`}
                onPointerDown={(event) => {
                  if (!event.isPrimary || event.button !== 0) return;
                  suppressClick.current = false;
                  drag.current = { x: event.clientX, time: performance.now() };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={(event) => {
                  const gesture = drag.current;
                  drag.current = null;
                  if (!gesture) return;
                  const distance = event.clientX - gesture.x;
                  suppressClick.current = Math.abs(distance) > 8;
                  const direction = comicSwipeDirection(
                    distance,
                    performance.now() - gesture.time,
                  );
                  if (direction) turn(direction);
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  turn(1);
                }}
              >
                {slot < 3 && (
                  <Image
                    src={`/anime/${anime.id}.jpg`}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 180px, 220px"
                    draggable={false}
                  />
                )}
              </button>
            );
          })}
        </div>
        <article className="anime-review" aria-label="Selected review">
          <p className="anime-status">{animeStatusLabels[current.status]}</p>
          <h3>{current.title}</h3>
          <p className="anime-rating">
            {current.rating === null ? (
              "Not rated yet"
            ) : (
              <>
                <span aria-hidden="true">★</span> {current.rating}{" "}
                <span className="anime-rating-denominator">/ 5</span>
              </>
            )}
          </p>
          {current.review && (
            <p className="anime-review-text">
              {current.review
                .split(/(La Peace)/)
                .map((part, index) =>
                  part === "La Peace" ? <em key={index}>{part}</em> : part,
                )}
            </p>
          )}
          <div className="anime-controls">
            <button
              type="button"
              aria-label="Previous anime"
              onClick={() => turn(-1)}
            >
              ←
            </button>
            <span aria-live="polite" aria-atomic="true">
              {active + 1} / {animeReviews.length}
              <span className="sr-only"> · {current.title}</span>
            </span>
            <button
              type="button"
              aria-label="Next anime"
              onClick={() => turn(1)}
            >
              →
            </button>
          </div>
        </article>
      </div>
      <label className="anime-jump">
        Find a show
        <select
          value={current.id}
          onChange={(event) =>
            setActive(
              animeReviews.findIndex(
                (anime) => anime.id === event.target.value,
              ),
            )
          }
        >
          {animeReviews.map((anime) => (
            <option key={anime.id} value={anime.id}>
              {anime.title} ·{" "}
              {anime.rating === null ? "Unrated" : `${anime.rating}/5`}
            </option>
          ))}
        </select>
      </label>
      <AnimeRecommendation />
    </section>
  );
}
