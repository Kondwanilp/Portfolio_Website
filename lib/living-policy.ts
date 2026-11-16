import { isLivingKind } from "./living-matter.ts";

/** Embedded previews remain public experiences; only the marked lab frame delegates playback. */
export const isLivingReviewFrame = (attribute: string | null | undefined) => attribute === "true";
export function canStartLivingScene({ kind, reducedMotion, documentHidden, reviewFrameAttribute }: { kind: string | undefined; reducedMotion: boolean; documentHidden: boolean; reviewFrameAttribute?: string | null }) {
  return isLivingKind(kind) && !reducedMotion && !documentHidden && !isLivingReviewFrame(reviewFrameAttribute);
}
