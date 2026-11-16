import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { normalizeDailyPuzzle, playUci } from "../lib/chess-puzzle.ts";

test("supports current FEN puzzle payloads and validates all solution moves", () => {
  const puzzle = normalizeDailyPuzzle({ puzzle: { id: "fen", fen: new Chess().fen(), solution: ["e2e4", "e7e5"] } });
  const game = new Chess(puzzle.fen);
  for (const move of puzzle.solution) playUci(game, move);
  assert.deepEqual(game.history(), ["e4", "e5"]);
});
test("reconstructs PGN positions at initialPly for older payloads", () => {
  const puzzle = normalizeDailyPuzzle({ puzzle: { id: "pgn", initialPly: 2, solution: ["g1f3", "b8c6"] }, game: { pgn: "1. e4 e5 2. Nf3 Nc6" } });
  const expected = new Chess(); expected.move("e4"); expected.move("e5");
  assert.equal(puzzle.fen, expected.fen());
});
test("rejects incomplete, illegal and out-of-range puzzles", () => {
  for (const payload of [null, {}, { puzzle: { id: "bad", solution: [] } }, { puzzle: { id: "bad", fen: new Chess().fen(), solution: ["e2e5"] } }, { puzzle: { id: "bad", initialPly: 99, solution: ["e2e4"] }, game: { pgn: "1. e4" } }]) assert.throws(() => normalizeDailyPuzzle(payload));
});
test("supports promotion moves", () => {
  const game = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
  playUci(game, "a7a8q");
  assert.equal(game.get("a8")?.type, "q");
});
