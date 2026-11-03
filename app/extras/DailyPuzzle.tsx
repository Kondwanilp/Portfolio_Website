
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Chess, type Square } from "chess.js";
import type {
  ChessboardOptions,
  PieceDropHandlerArgs,
} from "react-chessboard";

const Chessboard = dynamic(
  () => import("react-chessboard").then((module) => module.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="extras-daily-loading">
        Preparing today's puzzle...
      </div>
    ),
  }
);

type PuzzleData = {
  id: string;
  rating: number;
  plays: number;
  solution: string[];
  themes: string[];
  fen: string;
};

type DailyPuzzleResponse = {
  puzzle: PuzzleData;
  game?: {
    id?: string;
    pgn?: string;
    perf?: {
      name?: string;
    };
  };
};

function playUci(game: Chess, uci: string) {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
    throw new Error("Invalid puzzle move.");
  }

  const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;

  return game.move({
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    ...(promotion ? { promotion } : {}),
  });
}

function validateSolution(fen: string, solution: string[]) {
  const verificationGame = new Chess(fen);

  if (!solution.length) {
    throw new Error("This puzzle has no solution moves.");
  }

  for (const uci of solution) {
    playUci(verificationGame, uci);
  }
}

export default function DailyPuzzle() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const [fen, setFen] = useState("");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(
    "Find the best move for the side to play."
  );

  const gameRef = useRef<Chess | null>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(440);

  // Load today's Lichess puzzle.
  useEffect(() => {
    const controller = new AbortController();

    async function loadPuzzle() {
      setLoading(true);
      setError(null);
      setPuzzle(null);

      try {
        const response = await fetch(
          "https://lichess.org/api/puzzle/daily",
          {
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Puzzle service returned an error (${response.status}).`
          );
        }

        const data = (await response.json()) as DailyPuzzleResponse;

        if (
          !data.puzzle?.fen ||
          !Array.isArray(data.puzzle.solution)
        ) {
          throw new Error("The daily puzzle data was incomplete.");
        }

        // Validate the full solution before showing the puzzle.
        validateSolution(data.puzzle.fen, data.puzzle.solution);

        const newGame = new Chess(data.puzzle.fen);

        if (controller.signal.aborted) return;

        gameRef.current = newGame;

        setPuzzle(data.puzzle);
        setFen(newGame.fen());

        // The solver plays the side whose turn it is in the FEN.
        setOrientation(
          newGame.turn() === "w" ? "white" : "black"
        );

        setMoveIndex(0);
        setSolved(false);
        setFeedback("Find the best move for the side to play.");
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load today's puzzle."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPuzzle();

    return () => controller.abort();
  }, [reload]);

  // Keep the chessboard responsive.
  useEffect(() => {
    const container = boardContainerRef.current;

    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;

      if (width) {
        setBoardWidth(
          Math.max(240, Math.min(500, Math.floor(width)))
        );
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    const game = gameRef.current;

    if (!game || !puzzle || !targetSquare || solved) {
      return false;
    }

    const expectedMove = puzzle.solution[moveIndex];

    if (!expectedMove) return false;

    const attemptedMove = sourceSquare + targetSquare;
    const expectedSquares = expectedMove.slice(0, 4);

    if (attemptedMove !== expectedSquares) {
      setFeedback("Not quite. Take another look at the position.");
      return false;
    }

    try {
      const userMove = playUci(game, expectedMove);

      if (!userMove) return false;

      let nextIndex = moveIndex + 1;
      let opponentReply = "";

      // Automatically play the opponent's response.
      if (nextIndex < puzzle.solution.length) {
        const reply = playUci(
          game,
          puzzle.solution[nextIndex]
        );

        opponentReply = reply.san;
        nextIndex += 1;
      }

      setFen(game.fen());
      setMoveIndex(nextIndex);

      if (nextIndex >= puzzle.solution.length) {
        setSolved(true);
        setFeedback("Puzzle solved! Nicely played. ♟");
      } else {
        setFeedback(
          opponentReply
            ? `Correct! Your opponent replied ${opponentReply}. Find the next move.`
            : "Correct! Keep going."
        );
      }

      return true;
    } catch {
      setFeedback("Something went wrong. Try that move again.");
      return false;
    }
  }

  function resetPuzzle() {
    if (!puzzle) return;

    const newGame = new Chess(puzzle.fen);

    gameRef.current = newGame;

    setFen(newGame.fen());
    setMoveIndex(0);
    setSolved(false);
    setFeedback("Find the best move for the side to play.");
  }

  function revealSolution() {
    if (!puzzle) return;

    try {
      const solutionGame = new Chess(puzzle.fen);

      for (const uci of puzzle.solution) {
        playUci(solutionGame, uci);
      }

      gameRef.current = solutionGame;

      setFen(solutionGame.fen());
      setMoveIndex(puzzle.solution.length);
      setSolved(true);
      setFeedback("Solution revealed. Study the final position.");
    } catch {
      setFeedback("Unable to display the solution.");
    }
  }

  const chessboardOptions: ChessboardOptions = {
    id: "kondwani-daily-puzzle",
    position: fen,
    boardOrientation: orientation,
    allowDragging: Boolean(puzzle) && !loading && !solved,
    showNotation: true,
    animationDurationInMs: 180,
    lightSquareStyle: {
      backgroundColor: "#f0e9dc",
    },
    darkSquareStyle: {
      backgroundColor: "#91aaa0",
    },
    boardStyle: {
      width: boardWidth,
      height: boardWidth,
      borderRadius: "5px",
      overflow: "hidden",
      boxShadow: "0 5px 18px rgba(51, 75, 78, 0.12)",
    },
    onPieceDrop: handlePieceDrop,
  };

  const puzzleSide =
    orientation === "white" ? "White" : "Black";

  return (
    <section className="extras-daily-puzzle">
      <div className="extras-daily-header">
        <div>
          <p className="extras-daily-eyebrow">
            THE DAILY CHALLENGE
          </p>

          <h2>Can you find the move?</h2>

          <p>
            Take your time. Look for the tactic, calculate the line,
            and make your move.
          </p>
        </div>

        {puzzle && (
          <div className="extras-daily-rating">
            <span>PUZZLE RATING</span>
            <strong>{puzzle.rating}</strong>
          </div>
        )}
      </div>

      {loading && (
        <div className="extras-daily-message">
          <span className="extras-daily-spinner" />
          Loading today's puzzle...
        </div>
      )}

      {!loading && error && (
        <div className="extras-daily-message extras-daily-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
          >
            Try again ↻
          </button>
        </div>
      )}

      {!loading && puzzle && (
        <>
          <div className="extras-daily-layout">
            {/* PUZZLE BOARD */}

            <div className="extras-daily-board-panel">
              <div className="extras-daily-player">
                <span className="extras-daily-piece">
                  {orientation === "white" ? "♚" : "♔"}
                </span>

                <span>
                  {orientation === "white" ? "Black" : "White"}
                </span>

                <small>OPPONENT</small>
              </div>

              <div
                ref={boardContainerRef}
                className="extras-daily-board-wrap"
              >
                <Chessboard options={chessboardOptions} />
              </div>

              <div className="extras-daily-player">
                <span className="extras-daily-piece">
                  {orientation === "white" ? "♔" : "♚"}
                </span>

                <span>{puzzleSide}</span>

                <small>YOU</small>
              </div>

              <p className="extras-daily-board-hint">
                Drag a piece to make your move.
              </p>
            </div>

            {/* PUZZLE INFORMATION */}

            <aside className="extras-daily-sidebar">
              <div className="extras-daily-info-card">
                <p className="extras-daily-panel-label">
                  YOUR OBJECTIVE
                </p>

                <h3>
                  {solved
                    ? "Well played!"
                    : puzzleSide + " to move"}
                </h3>

                <p>
                  {solved
                    ? "You've completed today's puzzle."
                    : "Find the strongest continuation. The opponent's replies will be played automatically."}
                </p>
              </div>

              <div
                className="extras-daily-feedback"
                style={
                  solved
                    ? {
                        backgroundColor: "#e8f7ec",
                        border: "1px solid #9bd6ae",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }
                    : undefined
                }
              >
                <span
                  className="extras-daily-feedback-label"
                  style={
                    solved
                      ? {
                          color: "#08783d",
                          fontWeight: 800,
                          letterSpacing: "1.5px",
                        }
                      : undefined
                  }
                >
                  {solved ? "PUZZLE COMPLETE" : "YOUR PROGRESS"}
                </span>

                <p
                  style={
                    solved
                      ? {
                          color: "#16834a",
                          fontWeight: 700,
                        }
                      : undefined
                  }
                >
                  {feedback}
                </p>
              </div>

              <div className="extras-daily-themes">
                <p className="extras-daily-panel-label">
                  PUZZLE THEMES
                </p>

                <div>
                  {puzzle.themes.slice(0, 5).map((theme) => (
                    <span key={theme}>
                      {theme.replace(/([A-Z])/g, " $1")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="extras-daily-stats">
                <div>
                  <span>DIFFICULTY</span>
                  <strong>{puzzle.rating}</strong>
                </div>

                <div>
                  <span>ATTEMPTS</span>
                  <strong>
                    {puzzle.plays.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="extras-daily-actions">
                <button
                  type="button"
                  onClick={resetPuzzle}
                  className="extras-daily-secondary"
                >
                  ↻ Try again
                </button>

                <button
                  type="button"
                  onClick={revealSolution}
                  disabled={solved}
                  className="extras-daily-primary"
                >
                  Reveal solution
                </button>
              </div>

              <a
                href="https://lichess.org/training/daily"
                target="_blank"
                rel="noreferrer"
                className="extras-daily-source"
              >
                Puzzle provided by Lichess ↗
              </a>
            </aside>
          </div>

          <div className="extras-daily-footer">
            <span>ONE POSITION. ONE GOOD MOVE.</span>
            <span>TAKE YOUR TIME.</span>
          </div>
        </>
      )}
    </section>
  );
}
