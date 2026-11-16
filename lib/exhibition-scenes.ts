/** Decorative exhibition geometry. These scenes never read or change a game,
 * an audio player, a medical measurement, or a stored user record. */
import { smoothProgress } from "./living-matter.ts";

export type ExhibitionKind = "experience" | "leadership" | "journal" | "listening" | "chess" | "basketball" | "extras";
export type ScenePoint = { x: number; y: number };
export type ChessPieceKind = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
export type DecorativePiece = { square: string; file: number; rank: number; kind: ChessPieceKind; color: "white" | "black" };

export const CHESS_GEOMETRY = { x: 300, y: 125, square: 50, size: 400 } as const;
export const CHESS_BOARD = Array.from({ length: 64 }, (_, index) => {
  const file = index % 8;
  const rank = 8 - Math.floor(index / 8);
  return { file, rank, square: `${"abcdefgh"[file]}${rank}`, dark: (file + rank) % 2 === 1 };
});
const backRank: ChessPieceKind[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
export const DECORATIVE_START_POSITION: DecorativePiece[] = (["black", "white"] as const).flatMap(color => {
  const rank = color === "white" ? 1 : 8;
  const pawnRank = color === "white" ? 2 : 7;
  return backRank.flatMap((kind, file) => [
    { square: `${"abcdefgh"[file]}${rank}`, file, rank, kind, color },
    { square: `${"abcdefgh"[file]}${pawnRank}`, file, rank: pawnRank, kind: "pawn" as const, color },
  ]);
});

export function chessSquareCenter(file: number, rank: number): ScenePoint {
  return { x: CHESS_GEOMETRY.x + (file + .5) * CHESS_GEOMETRY.square, y: CHESS_GEOMETRY.y + (8.5 - rank) * CHESS_GEOMETRY.square };
}

/** A legal, isolated decorative opening move, never a playable-board mutation. */
export function knightOpeningPosition(progress: number): ScenePoint & { lift: number } {
  const t = smoothProgress((progress - .55) / .24);
  const from = chessSquareCenter(6, 1);
  const to = chessSquareCenter(5, 3);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * 42, lift: Math.sin(Math.PI * t) };
}

export const BASKETBALL_HOOP = { x: 730, y: 250, crossing: .78 } as const;
/** Ballistic-looking flight with net damping after its exact rim-plane crossing. */
export function basketballShotPosition(progress: number): ScenePoint & { rotation: number; net: number } {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  if (p <= BASKETBALL_HOOP.crossing) {
    const t = p / BASKETBALL_HOOP.crossing;
    return { x: 235 + 495 * t, y: 475 - 1000 * t + 775 * t * t, rotation: t * 340, net: 0 };
  }
  const t = (p - BASKETBALL_HOOP.crossing) / (1 - BASKETBALL_HOOP.crossing);
  return { x: 730 + 44 * (1 - Math.exp(-3 * t)), y: 250 + 125 * t + 80 * t * t, rotation: 340 + t * 70, net: Math.sin(Math.PI * t) * Math.exp(-t * 2) };
}

export const SIGNAL_BRANCHES = [
  { from: { x: 500, y: 325 }, control: { x: 440, y: 270 }, to: { x: 370, y: 235 }, delay: 0 },
  { from: { x: 500, y: 325 }, control: { x: 442, y: 387 }, to: { x: 365, y: 414 }, delay: .035 },
  { from: { x: 500, y: 325 }, control: { x: 568, y: 243 }, to: { x: 644, y: 211 }, delay: .055 },
  { from: { x: 500, y: 325 }, control: { x: 600, y: 341 }, to: { x: 688, y: 403 }, delay: .08 },
  { from: { x: 370, y: 235 }, control: { x: 313, y: 161 }, to: { x: 233, y: 153 }, delay: .16 },
  { from: { x: 370, y: 235 }, control: { x: 312, y: 274 }, to: { x: 221, y: 300 }, delay: .19 },
  { from: { x: 365, y: 414 }, control: { x: 325, y: 470 }, to: { x: 253, y: 497 }, delay: .21 },
  { from: { x: 644, y: 211 }, control: { x: 729, y: 158 }, to: { x: 802, y: 165 }, delay: .23 },
  { from: { x: 688, y: 403 }, control: { x: 759, y: 451 }, to: { x: 816, y: 482 }, delay: .25 },
] as const;

export function quadraticPoint(from: ScenePoint, control: ScenePoint, to: ScenePoint, t: number): ScenePoint {
  const bounded = Math.max(0, Math.min(1, t));
  return { x: (1 - bounded) ** 2 * from.x + 2 * (1 - bounded) * bounded * control.x + bounded ** 2 * to.x, y: (1 - bounded) ** 2 * from.y + 2 * (1 - bounded) * bounded * control.y + bounded ** 2 * to.y };
}

export function scenePoint(from: ScenePoint, to: ScenePoint, t: number): ScenePoint {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

export const JOURNAL_BRANCHES = [
  "M295 504C295 418 331 339 381 284C420 238 448 199 449 146",
  "M342 336C293 295 253 248 247 203",
  "M381 284C432 287 494 267 540 221",
  "M316 413C390 402 474 390 531 351",
  "M403 251C377 207 365 174 376 143",
  "M449 146C490 122 531 122 564 138",
] as const;
