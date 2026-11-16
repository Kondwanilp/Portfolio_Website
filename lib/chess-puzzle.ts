import { Chess, type Square } from "chess.js";

export type PuzzleData = {
  id: string;
  rating: number;
  plays: number;
  solution: string[];
  themes: string[];
  fen: string;
};

export function playUci(game: Chess, uci: string) {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) throw new Error("Invalid puzzle move.");
  return game.move({
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
  });
}

export function normalizeDailyPuzzle(input: unknown): PuzzleData {
  const data = input as { puzzle?: Partial<PuzzleData> & { initialPly?: number }; game?: { pgn?: string } };
  const puzzle = data?.puzzle;
  if (!puzzle || typeof puzzle.id !== "string" || !Array.isArray(puzzle.solution) || !puzzle.solution.length) {
    throw new Error("The daily puzzle data was incomplete.");
  }
  const game = new Chess();
  if (puzzle.fen) {
    game.load(puzzle.fen);
  } else {
    if (typeof data.game?.pgn !== "string") throw new Error("The puzzle position is missing.");
    game.loadPgn(data.game.pgn);
    const initialPly = puzzle.initialPly ?? game.history().length;
    if (!Number.isInteger(initialPly) || initialPly < 0 || initialPly > game.history().length) throw new Error("The puzzle starting move is invalid.");
    while (game.history().length > initialPly) game.undo();
  }
  const fen = game.fen();
  for (const move of puzzle.solution) {
    if (typeof move !== "string") throw new Error("The puzzle solution is invalid.");
    playUci(game, move);
  }
  return {
    id: puzzle.id,
    rating: Number.isFinite(puzzle.rating) ? puzzle.rating! : 0,
    plays: Number.isFinite(puzzle.plays) ? puzzle.plays! : 0,
    themes: Array.isArray(puzzle.themes) ? puzzle.themes.filter((theme) => typeof theme === "string") : [],
    solution: puzzle.solution,
    fen,
  };
}
