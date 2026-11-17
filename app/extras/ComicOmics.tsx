"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { comicIndex, comicReviews, comicSwipeDirection } from "@/lib/comic-omics";
import ImageLightbox from "../components/ImageLightbox";

export default function ComicOmics() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [background, setBackground] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; time: number } | null>(null);
  const suppressClick = useRef(false);
  const focusNextCover = useRef(false);
  const current = comicReviews[active];

  useLayoutEffect(() => {
    if (!focusNextCover.current) return;
    root.current?.querySelector<HTMLButtonElement>('.comic-cover[tabindex="0"]')?.focus({ preventScroll: true });
    focusNextCover.current = false;
  }, [active]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => setReduced(preference.matches);
    const visibilityChanged = () => setBackground(document.hidden);
    motionChanged();
    visibilityChanged();
    preference.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reduced || !visible || background || comicReviews.length < 2) return;
    const timer = window.setInterval(() => {
      if (!drag.current) setActive(index => comicIndex(index, 1, comicReviews.length));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reduced, visible, background]);

  function turn(direction: number) {
    focusNextCover.current = Boolean(root.current?.contains(document.activeElement) && !document.activeElement?.closest(".comic-controls"));
    const next = comicIndex(active, direction, comicReviews.length);
    setActive(next);
    setAnnouncement(`${comicReviews[next].title}. ${comicReviews[next].placeholder ? "Review pending." : "Review selected."}`);
  }

  function release(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const gesture = drag.current;
    drag.current = null;
    event.currentTarget.style.removeProperty("--drag-x");
    event.currentTarget.style.removeProperty("--drag-turn");
    event.currentTarget.removeAttribute("data-dragging");
    if (!gesture || cancelled) return;
    const distance = event.clientX - gesture.x;
    suppressClick.current = Math.abs(distance) > 8;
    const direction = comicSwipeDirection(distance, performance.now() - gesture.time);
    if (direction) turn(direction);
  }

  return <section id="comics" ref={root} className="mood-card comic-omics" aria-labelledby="comic-omics-title" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement) return;
      if (event.target instanceof HTMLElement && event.target.closest("dialog")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); turn(event.key === "ArrowRight" ? 1 : -1); }
    }}>
    <header className="mood-card-heading"><h2 id="comic-omics-title">Comic-Omics</h2><span>{active + 1} / {comicReviews.length}</span></header>
    <div className="comic-layout">
      <div className="comic-stage" aria-label="Comic cover stack">
        {comicReviews.map((comic, index) => {
          const slot = comicIndex(index, -active, comicReviews.length);
          return <button key={comic.id} type="button" className={`comic-cover comic-cover--${comic.color}`} style={{ "--slot": slot, zIndex: comicReviews.length - slot } as CSSProperties}
            tabIndex={slot === 0 ? 0 : -1} aria-hidden={slot !== 0} aria-label={`${comic.title}${comic.placeholder ? " placeholder cover" : " cover"}. Show next comic.`}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              suppressClick.current = false;
              drag.current = { x: event.clientX, time: performance.now() };
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.setAttribute("data-dragging", "true");
            }}
            onPointerMove={event => {
              if (!drag.current) return;
              const distance = event.clientX - drag.current.x;
              event.currentTarget.style.setProperty("--drag-x", `${distance}px`);
              event.currentTarget.style.setProperty("--drag-turn", `${distance / 20}deg`);
            }}
            onPointerUp={event => release(event)} onPointerCancel={event => release(event, true)}
            onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } turn(1); }}>
            {comic.cover ? <Image src={comic.cover} alt="" fill sizes="(max-width: 700px) 60vw, 240px" draggable={false} /> : <>
              <span className="comic-cover-top">{comic.publisher}</span>
              <span className="comic-cover-title">{comic.title}</span>
              <span className="comic-cover-orbit" aria-hidden="true" />
              <span className="comic-cover-bottom">Cover pending</span>
            </>}
          </button>;
        })}
      </div>
      <div className="comic-review">
        <p className="mood-small">{current.placeholder ? "A spot on the shelf" : current.edition}</p>
        <h3>{current.title}</h3>
        {current.rating !== undefined && <p className="comic-rating" aria-label={`${current.rating} out of 5 stars`}><span aria-hidden="true">{"★".repeat(current.rating)}{"☆".repeat(5 - current.rating)}</span><span>{current.rating} / 5</span></p>}
        <div className="comic-review-copy">{current.review ? <details key={current.id} className="comic-spoiler" onToggle={event => { if (event.currentTarget.open) setPaused(true); }}>
          <summary>Read my review <span>spoilers</span></summary>
          {current.review.split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </details> : <><p>My first review is on its way.</p><p className="mood-small">These are placeholder covers. Titles, artwork, and reviews are still to come.</p></>}</div>
        {current.cover && <div className="comic-cover-links">
          <ImageLightbox source={current.cover} label={`${current.title} cover`}><span>View cover ↗</span></ImageLightbox>
          {current.sourceUrl && <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer">Book details ↗</a>}
        </div>}
        {current.additionalCovers?.map(cover => <div className="comic-extra-volume" key={cover.source}>
          <ImageLightbox source={cover.source} label={cover.label}><Image src={cover.source} alt={cover.label} width={40} height={60} /></ImageLightbox>
          <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer">Volume 2 · Godbomb ↗</a>
        </div>)}
        <div className="comic-controls"><button type="button" aria-label="Previous comic" onClick={() => turn(-1)}>←</button><button type="button" aria-label="Next comic" onClick={() => turn(1)}>→</button>
          {!reduced && <button type="button" className="comic-autoplay" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Play rotation" : "Pause rotation"}</button>}
        </div>
        <p className="comic-hint">Press, drag, or fling a cover.</p>
      </div>
    </div>
    <span className="sr-only" role="status">{announcement}</span>
  </section>;
}
