export type SectionVisit = { inside: boolean; entered: number };
export type SectionBounds = { top: number; bottom: number };
export type SectionVisitResult = { state: SectionVisit; action: "enter" | "exit" | "wait" | "none" };

/** Continuous meaningful entry plus full-exit hysteresis; never mutates its input. */
export function advanceSectionVisit(state: SectionVisit, bounds: SectionBounds, viewportHeight: number, now: number): SectionVisitResult {
  const valid = Number.isFinite(viewportHeight) && viewportHeight > 0 && Number.isFinite(bounds.top) && Number.isFinite(bounds.bottom) && Number.isFinite(now);
  const outside = !valid || bounds.bottom <= 0 || bounds.top >= viewportHeight;
  if (outside) return { state: { inside: false, entered: 0 }, action: state.inside ? "exit" : "none" };
  // A visible section remains the same visit even near an edge. Only full exit
  // rearms it, preventing repeated entrances while slowly scrolling a boundary.
  if (state.inside) return { state, action: "none" };
  const meaningful = bounds.top < viewportHeight * .78 && bounds.bottom > Math.min(120, viewportHeight * .2);
  if (!meaningful) return { state: { inside: false, entered: 0 }, action: "none" };
  // Zero denotes unarmed. EPSILON preserves an entry beginning at clock time 0.
  const entered = state.entered > 0 ? state.entered : Math.max(Number.EPSILON, now);
  if (now - entered >= 80) return { state: { inside: true, entered }, action: "enter" };
  return { state: { inside: false, entered }, action: "wait" };
}
