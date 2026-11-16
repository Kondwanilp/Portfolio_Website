"use client";

import { useEffect, useState, type CSSProperties } from "react";
import LivingStage from "./LivingStage";
import { isLivingKind, LIVING_DURATION, type LivingEdge } from "@/lib/living-matter";
import { livingNavigation, type LivingKind } from "@/lib/living-navigation";
import { runLivingTimeline } from "@/lib/living-timeline";
import { advanceSectionVisit, type SectionVisit } from "@/lib/living-viewport";
import { canStartLivingScene, isLivingReviewFrame } from "@/lib/living-policy";

type Scene = { kind: LivingKind; top: number; width: number; height: number; targetEdge?: LivingEdge };

/** Passive viewport enhancement. Native links, scrolling and SSR content stay independent. */
export default function LivingTransitions() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Suppress only our marked review iframe, never ordinary embedded site previews.
    const reviewFrameAttribute = window.frameElement?.getAttribute("data-living-review");
    if (isLivingReviewFrame(reviewFrameAttribute)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visits = new WeakMap<HTMLElement, SectionVisit>();
    let targets: HTMLElement[] = [];
    let clock: ReturnType<typeof runLivingTimeline> | null = null;
    let destination: HTMLElement | null = null;
    let pendingFrame = 0;
    let lastY = window.scrollY;
    let alive = true;

    function finish(focus = false) {
      clock?.cancel(); clock = null;
      const heading = focus ? destination?.querySelector<HTMLElement>("h1, h2") : null;
      destination?.removeAttribute("aria-busy"); destination = null;
      setScene(null); setProgress(0);
      if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    }
    function start(target: HTMLElement) {
      finish();
      const kind = target.dataset.livingDestination;
      if (!canStartLivingScene({ kind, reducedMotion: reduced.matches, documentHidden: document.hidden, reviewFrameAttribute })) return;
      if (!isLivingKind(kind)) return;
      const navBottom = document.querySelector(".editorial-navigation")?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(0, Math.min(window.innerHeight * .25, navBottom));
      const width = window.innerWidth;
      const height = window.innerHeight - top;
      const scale = Math.min(width / 1000, height / 650);
      const offsetX = (width - 1000 * scale) / 2;
      const offsetY = (height - 650 * scale) / 2;
      const candidate = (target.querySelector("[data-living-portrait]") ?? target.closest(".about-page")?.querySelector("[data-living-portrait]"))?.getBoundingClientRect();
      const portrait = candidate && candidate.bottom > top && candidate.top < window.innerHeight ? candidate : undefined;
      const targetEdge = portrait ? { x: (portrait.right - offsetX) / scale, y: (portrait.top - top - offsetY) / scale, height: portrait.height / scale } : undefined;
      destination = target; target.setAttribute("aria-busy", "true");
      setProgress(0); setScene({ kind, top, width, height, targetEdge });
      clock = runLivingTimeline(setProgress, () => finish(), LIVING_DURATION);
    }
    function check() {
      pendingFrame = 0;
      if (!alive) return;
      if (document.querySelector("dialog[open]")) { if (clock) finish(); return; }
      if (destination && !destination.isConnected) finish();
      const now = performance.now();
      for (const target of targets) {
        if (!target.isConnected) continue;
        const rect = target.getBoundingClientRect();
        const visit = advanceSectionVisit(visits.get(target) ?? { inside: false, entered: 0 }, rect, window.innerHeight, now);
        visits.set(target, visit.state);
        if (visit.action === "exit" && destination === target) clock?.complete();
        else if (visit.action === "enter" && !(destination === target && clock)) start(target);
        else if (visit.action === "wait") schedule();
      }
    }
    function schedule() { if (alive && !pendingFrame) pendingFrame = requestAnimationFrame(check); }
    function discover() {
      targets = [...document.querySelectorAll<HTMLElement>("[data-living-destination]")];
      schedule();
    }
    function scroll() {
      const y = window.scrollY;
      const now = performance.now();
      const delta = y - lastY;
      if (clock && delta) clock.addScroll(delta, now);
      lastY = y;
      schedule();
    }
    function resize() { finish(); lastY = window.scrollY; schedule(); }
    function visibility() { if (document.hidden) finish(); else schedule(); }
    function key(event: KeyboardEvent) { if (document.querySelector("dialog[open]")) return; if (event.key === "Escape") finish(true); else if (event.key === "Tab") finish(); }
    function interaction(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        if (livingNavigation(anchor.href, window.location.href, { button: event.button, metaKey: event.metaKey, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, target: anchor.target, download: anchor.hasAttribute("download") })) finish();
      } else if (event.target.closest("input, select, textarea, summary, button")) finish();
    }
    function route() { finish(); visits = new WeakMap<HTMLElement, SectionVisit>(); lastY = window.scrollY; schedule(); }
    const observer = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest(".living-transition"))) discover();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "style"] });
    document.addEventListener("keydown", key);
    document.addEventListener("click", interaction, true);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("popstate", route);
    reduced.addEventListener("change", resize);
    discover();
    return () => {
      alive = false; observer.disconnect(); cancelAnimationFrame(pendingFrame); finish();
      document.removeEventListener("keydown", key);
      document.removeEventListener("click", interaction, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", route);
      reduced.removeEventListener("change", resize);
    };
  }, []);
  if (!scene) return null;
  return <div className="living-transition" style={{ top: scene.top } as CSSProperties}>
    <LivingStage {...scene} progress={progress} />
  </div>;
}
