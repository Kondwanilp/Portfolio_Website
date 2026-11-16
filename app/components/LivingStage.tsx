"use client";

import LivingScene from "./LivingScene";
import ExhibitionScenes from "./ExhibitionScenes";
import { livingReveal, smoothProgress, type LivingEdge, type LivingKind } from "@/lib/living-matter";

/** One reveal and renderer for the real destination and the review laboratory. */
export default function LivingStage({ kind, progress, width, height, targetEdge }: { kind: LivingKind; progress: number; width: number; height: number; targetEdge?: LivingEdge }) {
  const reveal = livingReveal(progress, kind);
  const radius = Math.hypot(width, height) * reveal;
  const mask = kind === "research"
    ? `radial-gradient(circle at 50% 50%, transparent ${Math.max(0, radius - 100)}px, #000 ${radius + 1}px)`
    : `linear-gradient(100deg, transparent ${reveal * 125 - 25}%, #000 ${reveal * 125}%)`;
  return <div className={`living-stage living-stage--${kind}`} aria-hidden="true">
    <div className="living-transition-veil" style={{ maskImage: mask, opacity: smoothProgress(progress / .1) * (progress > .98 ? (1 - progress) / .02 : 1) }} />
    {kind === "research" || kind === "about" ? <LivingScene kind={kind} progress={progress} targetEdge={targetEdge} /> : <ExhibitionScenes kind={kind} progress={progress} />}
  </div>;
}
