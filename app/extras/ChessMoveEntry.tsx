"use client";

import { useState, type FormEvent } from "react";

export default function ChessMoveEntry({ disabled, onMove }: { disabled: boolean; onMove: (move: string) => boolean }) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const move = String(new FormData(form).get("move")).trim().toLowerCase();
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move) || !onMove(move)) {
      setError("That move could not be played. Use a move such as e2e4 or a7a8q.");
      return;
    }
    setError(""); form.reset();
  }
  return (
    <form className="chess-move-entry" onSubmit={submit}>
      <label>Enter a move<input name="move" placeholder="e2e4" autoComplete="off" autoCapitalize="none" spellCheck={false} required disabled={disabled} aria-describedby="chess-move-help" /></label>
      <button type="submit" disabled={disabled}>Play move</button>
      <small id="chess-move-help">Use the starting and ending squares. Add q, r, b, or n to promote a pawn.</small>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
