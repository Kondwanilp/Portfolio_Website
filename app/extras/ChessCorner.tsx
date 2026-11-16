
"use client";

import Icon from "../components/Icon";

import { useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import "./chess-hub.css";
import "./daily-puzzle.css";

type ChessMode = "daily" | "freeplay";

const DailyPuzzle = dynamic(() => import("./DailyPuzzle"), {
  loading: () => <p role="status">Preparing today&apos;s puzzle...</p>,
});
const FreePlayChess = dynamic(() => import("./FreePlayChess"), {
  loading: () => <p role="status">Setting up the chessboard...</p>,
});

export default function ChessCorner() {
  const [mode, setMode] = useState<ChessMode>("daily");

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextMode: ChessMode = mode === "daily" ? "freeplay" : "daily";
    if (event.key === "Home") nextMode = "daily";
    if (event.key === "End") nextMode = "freeplay";
    setMode(nextMode);
    document.getElementById(`chess-tab-${nextMode}`)?.focus();
  }

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
        onKeyDown={handleTabKeyDown}
      >
        <button
          type="button"
          role="tab"
          id="chess-tab-daily"
          aria-controls="chess-panel-daily"
          tabIndex={mode === "daily" ? 0 : -1}
          aria-selected={mode === "daily"}
          className={
            mode === "daily"
              ? "extras-chess-tab is-active"
              : "extras-chess-tab"
          }
          onClick={() => setMode("daily")}
        >
          <span className="extras-chess-tab-icon"><Icon name="pawn" /></span>

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
          id="chess-tab-freeplay"
          aria-controls="chess-panel-freeplay"
          tabIndex={mode === "freeplay" ? 0 : -1}
          aria-selected={mode === "freeplay"}
          className={
            mode === "freeplay"
              ? "extras-chess-tab is-active"
              : "extras-chess-tab"
          }
          onClick={() => setMode("freeplay")}
        >
          <span className="extras-chess-tab-icon"><Icon name="knight" /></span>

          <span className="extras-chess-tab-text">
            <strong>Free Play</strong>
            <small>PLAY A LOCAL GAME</small>
          </span>

          {mode === "freeplay" && (
            <span className="extras-chess-tab-indicator">●</span>
          )}
        </button>
      </div>

      <div className="extras-chess-mode-content" role="tabpanel" id={`chess-panel-${mode}`} aria-labelledby={`chess-tab-${mode}`} tabIndex={0}>
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
