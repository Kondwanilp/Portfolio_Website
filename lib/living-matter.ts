/** Scientific illustration geometry, not a molecular simulation.
 * Anatomy: Alberts et al., Molecular Biology of the Cell, NCBI Bookshelf NBK26894.
 * Translation: NCBI Bookshelf NBK26829. GGU encodes glycine; UAA is termination.
 * All coordinates share the renderer's 1000 × 650 artboard.
 */
export const LIVING_KINDS = ["research", "about", "experience", "leadership", "journal", "listening", "chess", "basketball", "extras"] as const;
export type LivingKind = (typeof LIVING_KINDS)[number];
export function isLivingKind(value: string | undefined): value is LivingKind { return LIVING_KINDS.some(kind => kind === value); }
export type LivingEdge = { x: number; y: number; height: number };
export const LIVING_DURATION = 2500;

export function clampProgress(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function smoothProgress(value: number) {
  const t = clampProgress(value);
  return t * t * (3 - 2 * t);
}

export function livingReveal(progress: number, kind: LivingKind = "research") {
  const start = kind === "research" ? .70 : .66;
  return smoothProgress((progress - start) / (1 - start));
}

// An asymmetrical, elongated outer membrane. Its outline never morphs into UI.
export const OUTER_MEMBRANE = "M226 364C187 300 222 232 306 209C394 184 448 210 500 202C576 188 630 157 707 181C784 203 824 248 813 302C802 354 752 382 699 397C628 421 608 447 533 460C435 482 352 460 297 430C264 411 240 390 226 364Z";

// One continuous inner membrane. Each hairpin is an invagination connected to
// that boundary; the narrow pockets between membranes remain contiguous.
export const INNER_MEMBRANE = "M250 355C216 301 247 251 311 232C332 223 353 223 373 225C389 228 391 252 386 270C379 291 356 318 363 334C367 348 378 346 386 334C405 311 409 279 424 264C439 246 450 244 464 241C478 239 490 242 493 257C495 280 477 309 482 331C486 350 500 352 509 336C519 316 517 278 531 254C544 232 561 220 583 215C601 208 622 200 641 202C651 205 660 219 659 234C654 262 623 282 628 302C631 318 647 318 657 304C675 281 678 244 691 229C701 215 713 218 730 225C771 247 795 269 785 305C777 341 736 365 696 374C677 382 666 390 650 397C635 405 620 410 608 412C591 409 589 388 596 369C602 352 621 335 612 321C601 306 587 312 579 331C566 352 575 394 556 414C550 424 541 431 529 434C510 434 501 430 496 421C482 395 498 365 485 350C473 336 461 341 455 360C447 382 463 414 446 435C422 440 398 435 389 428C377 416 383 394 375 376C368 357 348 354 344 368C339 384 350 400 348 414C308 403 270 387 250 355Z";

export const MEMBRANE_HIGHLIGHT = "M244 292C267 229 330 210 401 219M556 204C623 173 704 182 748 218M782 286C777 331 738 355 706 366";

export const TRANSLATION_SEQUENCE = [
  { codon: "AUG", aminoAcid: "Met", color: "#719D9A" },
  { codon: "GCU", aminoAcid: "Ala", color: "#CFAB7D" },
  { codon: "UUU", aminoAcid: "Phe", color: "#BE8970" },
  { codon: "GGU", aminoAcid: "Gly", color: "#A1B8A3" },
  { codon: "UAA", aminoAcid: null, color: "#625D53" },
] as const;

function random(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const ENERGY_PARTICLES = Array.from({ length: 24 }, (_, index) => {
  const left = index % 2 === 0;
  const start = { x: left ? 55 + random(index + 2) * 130 : 835 + random(index + 3) * 100, y: 80 + random(index + 5) * 480 };
  const end = { x: 305 + random(index + 7) * 420, y: 245 + random(index + 11) * 135 };
  return { start, end, bend: 45 + random(index + 13) * 155, delay: random(index + 17) * .13, size: 1.7 + random(index + 19) * 2.4 };
});

export function particlePosition(index: number, progress: number) {
  const particle = ENERGY_PARTICLES[index];
  const t = smoothProgress((progress - particle.delay) / .37);
  const arch = Math.sin(Math.PI * t) * particle.bend;
  return { x: particle.start.x + (particle.end.x - particle.start.x) * t, y: particle.start.y + (particle.end.y - particle.start.y) * t - arch, opacity: Math.sin(Math.PI * t) * .9 };
}

export function translationPhase(progress: number) {
  const total = clampProgress((progress - .22) / .44) * 4;
  const codon = Math.min(4, Math.floor(total));
  const fraction = codon === 4 ? 1 : total - codon;
  const advance = codon + smoothProgress((fraction - .72) / .28);
  return { codon, fraction, x: 275 + Math.min(4, advance) * 100, count: Math.min(4, Math.floor(total + .48)) };
}
