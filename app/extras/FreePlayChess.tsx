"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Chess, type Square } from "chess.js";
import type {
  ChessboardOptions,
  PieceDropHandlerArgs,
} from "react-chessboard";

// ============================================
// BOT SETTINGS
// ============================================

const BOT_RATING = 1400;
const BOT_NAME = "Kondwani";

// ============================================
// CHESSBOARD
// ============================================

const Chessboard = dynamic(
  () => import("react-chessboard").then((module) => module.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="extras-chess-board-loading">
        Setting up the chessboard...
      </div>
    ),
  }
);

// ============================================
// GAME STATUS
// ============================================

function getGameStatus(game: Chess, humanColor: "w" | "b"): string {
  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "b" : "w";

    return winner === humanColor
      ? "You win by checkmate!"
      : `${BOT_NAME} wins by checkmate!`;
  }

  if (game.isStalemate()) return "Draw by stalemate.";
  if (game.isThreefoldRepetition()) return "Draw by repetition.";

  if (game.isInsufficientMaterial()) {
    return "Draw — insufficient material.";
  }

  if (game.isDraw()) return "The game is a draw.";

  if (game.isCheck()) {
    return game.turn() === humanColor
      ? "You're in check!"
      : `${BOT_NAME} is in check!`;
  }

  return game.turn() === humanColor
    ? "Your turn. Make a move."
    : `${BOT_NAME} to move`;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ChessCorner() {
  const gameRef = useRef<Chess | null>(null);
  const engineRef = useRef<Worker | null>(null);
  const orientationRef = useRef<"white" | "black">("white");

  if (gameRef.current === null) {
    gameRef.current = new Chess();
  }

  const game = gameRef.current;
  const boardContainerRef = useRef<HTMLDivElement>(null);

  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("Loading your opponent...");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [boardWidth, setBoardWidth] = useState(480);

  const [engineReady, setEngineReady] = useState(false);
  const [engineThinking, setEngineThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  // ============================================
  // PLAYER COLORS
  // The player at the TOP is always Stockfish.
  // The player at the BOTTOM is always you.
  // ============================================

  function getBotColor(): "w" | "b" {
    return orientationRef.current === "white" ? "b" : "w";
  }

  function getHumanColor(): "w" | "b" {
    return orientationRef.current === "white" ? "w" : "b";
  }

  // ============================================
  // REFRESH GAME INFORMATION
  // ============================================

  function refreshGame() {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    setFen(currentGame.fen());
    setMoveHistory(currentGame.history());
    setStatus(getGameStatus(currentGame, getHumanColor()));
  }

  // ============================================
  // STOCKFISH MAKES A MOVE
  // Stockfish always plays the color at the top.
  // ============================================

  function startBotMove() {
    const currentGame = gameRef.current;
    const engine = engineRef.current;

    if (
      !currentGame ||
      !engine ||
      currentGame.isGameOver() ||
      currentGame.turn() !== getBotColor()
    ) {
      return;
    }

    setEngineThinking(true);
    setStatus(`${BOT_NAME} is thinking...`);

    engine.postMessage(`position fen ${currentGame.fen()}`);
    engine.postMessage("go movetime 1000");
  }

  // ============================================
  // LOAD STOCKFISH
  // ============================================

  useEffect(() => {
    let isMounted = true;

    const engine = new Worker(
      "/stockfish/stockfish-19-lite-single.js"
    );

    engineRef.current = engine;

    engine.onmessage = (event: MessageEvent) => {
      if (!isMounted) return;

      const message = String(event.data);

      if (message.includes("uciok")) {
        engine.postMessage(
          "setoption name UCI_LimitStrength value true"
        );

        engine.postMessage(
          `setoption name UCI_Elo value ${BOT_RATING}`
        );

        engine.postMessage("isready");
      }

      if (message.includes("readyok")) {
        setEngineReady(true);

        const currentGame = gameRef.current;

        if (
          currentGame &&
          currentGame.turn() === getBotColor()
        ) {
          startBotMove();
        } else {
          setStatus("Your turn. Make a move.");
        }
      }

      if (message.startsWith("bestmove")) {
        const bestMove = message.split(/\s+/)[1];

        if (
          !bestMove ||
          bestMove === "(none)" ||
          bestMove === "0000"
        ) {
          setEngineThinking(false);
          return;
        }

        try {
          const currentGame = gameRef.current;

          if (
            !currentGame ||
            currentGame.isGameOver() ||
            currentGame.turn() !== getBotColor()
          ) {
            setEngineThinking(false);
            return;
          }

          currentGame.move({
            from: bestMove.slice(0, 2) as Square,
            to: bestMove.slice(2, 4) as Square,
            promotion: (bestMove[4] || "q") as
              | "q"
              | "r"
              | "b"
              | "n",
          });

          setFen(currentGame.fen());
          setMoveHistory(currentGame.history());
          setStatus(getGameStatus(currentGame, getHumanColor()));
        } catch (error) {
          console.error("Stockfish move error:", error);
          setEngineError("The engine couldn't make its move.");
        }

        setEngineThinking(false);
      }
    };

    engine.onerror = (error) => {
      console.error("Stockfish failed to load:", error);

      if (isMounted) {
        setEngineError(
          "Couldn't load the chess engine. Please refresh the page."
        );
      }
    };

    engine.postMessage("uci");

    return () => {
      isMounted = false;
      engine.terminate();
      engineRef.current = null;
    };
  }, []);

  // ============================================
  // RESPONSIVE BOARD
  // ============================================

  useEffect(() => {
    const container = boardContainerRef.current;

    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;

      if (width) {
        setBoardWidth(
          Math.max(240, Math.min(520, Math.floor(width)))
        );
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // ============================================
  // YOU MAKE A MOVE
  // ============================================

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    if (
      !targetSquare ||
      !engineReady ||
      engineThinking ||
      game.isGameOver() ||
      game.turn() !== getHumanColor()
    ) {
      return false;
    }

    try {
      const move = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (!move) return false;

      refreshGame();

      if (!game.isGameOver()) {
        startBotMove();
      }

      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // ROTATE BOARD
  // ============================================

  function rotateBoard() {
    if (!engineReady || engineThinking || game.isGameOver()) return;

    const nextOrientation =
      orientationRef.current === "white" ? "black" : "white";

    orientationRef.current = nextOrientation;
    setOrientation(nextOrientation);

    // If it is now Stockfish's turn, Stockfish moves.
    if (game.turn() === getBotColor()) {
      startBotMove();
    } else {
      setStatus("Your turn. Make a move.");
    }
  }

  // ============================================
  // UNDO TURN
  // ============================================

  function undoMove() {
    if (engineThinking || moveHistory.length === 0) return;

    game.undo();

    if (game.history().length > 0) {
      game.undo();
    }

    refreshGame();

    if (!game.isGameOver() && game.turn() === getBotColor()) {
      startBotMove();
    }
  }

  // ============================================
  // NEW GAME
  // Preserve orientation and let the top player
  // (Stockfish) open if the top player is White.
  // ============================================

  function startNewGame() {
    if (engineThinking) return;

    game.reset();

    setFen(game.fen());
    setMoveHistory([]);
    setEngineError(null);
    setStatus("Your turn. Make a move.");

    if (engineReady && game.turn() === getBotColor()) {
      startBotMove();
    }
  }

  // ============================================
  // MOVE HISTORY
  // ============================================

  const moveRows = useMemo(() => {
    const rows: Array<{
      number: number;
      white: string;
      black: string;
    }> = [];

    for (let index = 0; index < moveHistory.length; index += 2) {
      rows.push({
        number: Math.floor(index / 2) + 1,
        white: moveHistory[index],
        black: moveHistory[index + 1] ?? "",
      });
    }

    return rows;
  }, [moveHistory]);

  // ============================================
  // CHESSBOARD SETTINGS
  // ============================================

  const chessboardOptions: ChessboardOptions = {
    id: "kondwani-chess-corner",

    position: fen,

    boardOrientation: orientation,

    allowDragging:
      engineReady &&
      !engineThinking &&
      !game.isGameOver() &&
      game.turn() === getHumanColor(),

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

  // ============================================
  // PLAYER LABELS
  // ============================================

  const topPlayerPiece = orientation === "white" ? "♚" : "♔";
  const bottomPlayerPiece = orientation === "white" ? "♔" : "♚";

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="extras-chess-corner">
      <div className="extras-chess-heading">
        <div>
          <p className="extras-chess-eyebrow">
            THE CHESSBOARD
          </p>

          <h2>Make a move.</h2>

          <p>
            Think you can beat me? Let's find out.
          </p>
        </div>

        <span className="extras-chess-mode">
          PLAY AGAINST ME
        </span>
      </div>

      <div className="extras-chess-layout">
        {/* CHESSBOARD */}

        <div className="extras-chess-board-area">
          {/* TOP PLAYER: ALWAYS STOCKFISH */}

          <div className="extras-chess-player extras-chess-player-top">
            <span className="extras-chess-player-piece">
              {topPlayerPiece}
            </span>

            <span>
              {BOT_NAME} · {BOT_RATING}
            </span>
          </div>

          {/* BOARD */}

          <div
            ref={boardContainerRef}
            className="extras-chess-board-wrap"
          >
            <Chessboard options={chessboardOptions} />
          </div>

          {/* BOTTOM PLAYER: ALWAYS YOU */}

          <div className="extras-chess-player extras-chess-player-bottom">
            <span className="extras-chess-player-piece">
              {bottomPlayerPiece}
            </span>

            <span>You</span>
          </div>

          {/* BOARD CONTROLS */}

          <div className="extras-chess-board-controls">
            <button
              type="button"
              onClick={rotateBoard}
              disabled={
                !engineReady ||
                engineThinking ||
                game.isGameOver()
              }
              className="extras-chess-secondary-button"
            >
              ↻ {orientation === "white" ? "Play as Black" : "Play as White"}
            </button>

            <span>
              {engineThinking
                ? `${BOT_NAME} is thinking...`
                : engineReady
                  ? `You're playing ${getHumanColor() === "w" ? "White" : "Black"}.`
                  : "Preparing your opponent..."}
            </span>
          </div>
        </div>

        {/* GAME INFORMATION */}

        <aside className="extras-chess-sidebar">
          {/* CURRENT POSITION */}

          <div className="extras-chess-status-card">
            <p className="extras-chess-panel-label">
              CURRENT POSITION
            </p>

            <div className="extras-chess-status">
              <span className="extras-chess-status-dot" />

              {engineError
                ? "ENGINE ERROR"
                : engineThinking
                  ? `${BOT_NAME} is thinking...`
                  : !engineReady
                    ? "Loading Stockfish..."
                    : getGameStatus(game, getHumanColor())}
            </div>

            <p className="extras-chess-hint">
              {engineError
                ? engineError
                : !engineReady
                  ? "Your opponent is getting ready."
                  : game.isGameOver()
                    ? "Game over. Ready for another round?"
                    : engineThinking
                      ? "Let's see what I've got."
                      : `You're playing ${getHumanColor() === "w" ? "White" : "Black"}. ${BOT_NAME} plays ${getBotColor() === "w" ? "White" : "Black"}.`}
            </p>
          </div>

          {/* MOVE HISTORY */}

          <div className="extras-chess-history">
            <div className="extras-chess-history-heading">
              <h3>Move history</h3>

              <span>
                {moveHistory.length} MOVES
              </span>
            </div>

            {moveRows.length === 0 ? (
              <div className="extras-chess-empty">
                <span>♟</span>

                <p>No moves yet.</p>

                <small>
                  Your game will appear here as you play.
                </small>
              </div>
            ) : (
              <div className="extras-chess-move-list">
                {moveRows.map((row) => (
                  <div
                    className="extras-chess-move-row"
                    key={row.number}
                  >
                    <span className="extras-chess-move-number">
                      {row.number}.
                    </span>

                    <span>{row.white}</span>

                    <span>{row.black}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GAME ACTIONS */}

          <div className="extras-chess-actions">
            <button
              type="button"
              onClick={undoMove}
              disabled={
                moveHistory.length === 0 || engineThinking
              }
              className="extras-chess-secondary-button"
            >
              ↶ Undo turn
            </button>

            <button
              type="button"
              onClick={startNewGame}
              disabled={engineThinking}
              className="extras-chess-primary-button"
            >
              New game ↗
            </button>
          </div>

          {/* CHESS.COM CHALLENGE */}

          <div
            className="extras-chess-challenge"
            style={{
              marginTop: "22px",
              padding: "20px",
              backgroundColor: "#f4f0e8",
              border: "1px solid #ded7ca",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "#858074",
                marginBottom: "8px",
              }}
            >
              THINK YOU CAN BEAT ME?
            </p>

            <h3
              style={{
                fontSize: "19px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#292720",
              }}
            >
              Let's play a real game.
            </h3>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#777267",
                marginBottom: "16px",
              }}
            >
              Find me on Chess.com and send me a challenge.
              No excuses when you lose.
            </p>

            <a
              href="https://www.chess.com/member/attacktitan38"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px 16px",
                borderRadius: "5px",
                backgroundColor: "#769656",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ♟ Challenge me on Chess.com ↗
            </a>

            <p
              style={{
                marginTop: "10px",
                fontSize: "11px",
                color: "#858074",
                textAlign: "center",
              }}
            >
              Chess.com · @attacktitan38
            </p>
          </div>
        </aside>
      </div>

      {/* FOOTER */}

      <div className="extras-chess-footer">
        <span>THINK BEFORE YOU MOVE.</span>

        <span>GOOD LUCK. YOU'LL NEED IT.</span>
      </div>
    </section>
  );
}