
"use client";

import { useState } from "react";
import DailyPuzzle from "./DailyPuzzle";
import FreePlayChess from "./FreePlayChess";
import "./chess-hub.css";
import "./daily-puzzle.css";

type ChessMode = "daily" | "freeplay";

export default function ChessCorner() {
  const [mode, setMode] = useState<ChessMode>("daily");

  return (
    <div className="extras-chess-hub">

      <div className="extras-chess-hub-header">
        <div>
          <p>THE CHESS ROOM</p>
          <h2>Choose your game.</h2>
        </div>

        <span>CHESS CORNER · EST. 2026</span>
      </div>

      <div
        className="extras-chess-tabs"
        role="tablist"
        aria-label="Chess Corner activities"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "daily"}
          className={
            mode === "daily"
              ? "extras-chess-tab is-active"
              : "extras-chess-tab"
          }
          onClick={() => setMode("daily")}
        >
          <span className="extras-chess-tab-icon">♟</span>

          <span className="extras-chess-tab-text">
            <strong>Daily Puzzle</strong>
            <small>THE DAILY CHALLENGE</small>
          </span>

          {mode === "daily" && (
            <span className="extras-chess-tab-indicator">●</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === "freeplay"}
          className={
            mode === "freeplay"
              ? "extras-chess-tab is-active"
              : "extras-chess-tab"
          }
          onClick={() => setMode("freeplay")}
        >
          <span className="extras-chess-tab-icon">♞</span>

          <span className="extras-chess-tab-text">
            <strong>Free Play</strong>
            <small>PLAY A LOCAL GAME</small>
          </span>

          {mode === "freeplay" && (
            <span className="extras-chess-tab-indicator">●</span>
          )}
        </button>
      </div>

      <div className="extras-chess-mode-content">
        {mode === "daily" ? (
          <DailyPuzzle />
        ) : (
          <FreePlayChess />
        )}
      </div>

      <p className="extras-chess-hub-note">
        A good move is worth taking your time over.
      </p>

    </div>
  );
}
