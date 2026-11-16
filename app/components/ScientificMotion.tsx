"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MOTION_DURATION_MS, MOTION_SESSION_VERSION, shouldPlayMotion } from "@/lib/motion";

export default function ScientificMotion({ name, children, ready = true, durationMs = MOTION_DURATION_MS, threshold = 0.2, replay = false }: {
  name: string;
  children: ReactNode;
  ready?: boolean;
  durationMs?: number;
  threshold?: number;
  replay?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const figure = ref.current;
    if (!figure) return;
    if (!ready || !("IntersectionObserver" in window)) {
      figure.dataset.motion = "settled";
      figure.dataset.enhanced = "false";
      for (const control of figure.querySelectorAll<HTMLButtonElement>(".motion-skip, .motion-replay")) control.hidden = true;
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const key = `${MOTION_SESSION_VERSION}:${name}`;
    let played = false;
    let intersecting = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try { played = sessionStorage.getItem(key) === "played"; } catch { /* Storage may be disabled. */ }
    const button = figure.querySelector<HTMLButtonElement>(".motion-skip");
    const replayButton = figure.querySelector<HTMLButtonElement>(".motion-replay");
    function finish() {
      figure!.dataset.motion = "settled";
      if (replayButton) replayButton.hidden = preference.matches;
      if (document.activeElement === button) {
        const focusTarget = replayButton && !preference.matches ? replayButton : figure!;
        focusTarget.focus({ preventScroll: true });
      }
      if (button) button.hidden = true;
      clearTimeout(timer);
    }
    function visibility() { figure!.dataset.visible = String(intersecting && !document.hidden); }
    function preferenceChanged() {
      if (preference.matches) {
        figure!.dataset.enhanced = "false";
        finish();
      } else {
        if (replayButton) replayButton.hidden = !played;
        if (intersecting && !played) start();
      }
    }
    function start() {
      if (preference.matches) return;
      played = true;
      try { sessionStorage.setItem(key, "played"); } catch { /* Once per mount fallback. */ }
      figure!.dataset.motion = "playing";
      figure!.dataset.enhanced = "true";
      if (button) button.hidden = false;
      if (document.activeElement === replayButton) button?.focus({ preventScroll: true });
      if (replayButton) replayButton.hidden = true;
      clearTimeout(timer);
      timer = setTimeout(finish, durationMs);
    }
    button?.addEventListener("click", finish);
    replayButton?.addEventListener("click", start);
    if (replayButton) replayButton.hidden = !played || preference.matches;
    preference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      visibility();
      if (!intersecting || !shouldPlayMotion(preference.matches, played)) return;
      start();
    }, { threshold });
    observer.observe(figure);
    return () => {
      finish();
      observer.disconnect();
      clearTimeout(timer);
      button?.removeEventListener("click", finish);
      replayButton?.removeEventListener("click", start);
      if (replayButton) replayButton.hidden = true;
      preference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [name, ready, durationMs, threshold, replay]);
  return <div ref={ref} tabIndex={-1} className={`scientific-motion scientific-motion--${name}`} data-motion="settled">
    {children}<button className="motion-skip" type="button" hidden>Skip animation</button>
    {replay && <button className="motion-replay" type="button" hidden>Replay animation</button>}
  </div>;
}
