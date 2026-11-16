export type { LivingKind } from "./living-matter.ts";
import type { LivingKind } from "./living-matter.ts";
export type NavigationGesture = { button: number; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; target?: string; download?: boolean };

/** Classify an enhancement; the anchor always retains responsibility for navigation. */
export function livingNavigation(href: string, current: string, gesture: NavigationGesture): LivingKind | null {
  if (gesture.button !== 0 || gesture.metaKey || gesture.ctrlKey || gesture.shiftKey || gesture.altKey || gesture.download || (gesture.target && gesture.target !== "_self")) return null;
  let next: URL;
  try { next = new URL(href, current); } catch { return null; }
  const previous = new URL(current);
  if (next.origin !== previous.origin || next.href === previous.href) return null;
  if (next.pathname === "/research" && !next.hash) return "research";
  if ((next.pathname === "/about" && !next.hash) || (next.pathname === "/" && next.hash === "#about")) return "about";
  const routes: Record<string, LivingKind> = { "/experience": "experience", "/leadership": "leadership", "/journal": "journal", "/extras": "extras", "/extras/listening": "listening", "/extras/chess": "chess", "/extras/basketball": "basketball" };
  if (!next.hash && routes[next.pathname]) return routes[next.pathname];
  return null;
}

export const livingSessionKey = (kind: LivingKind) => `renaissance-living-5.2:${kind}`;
