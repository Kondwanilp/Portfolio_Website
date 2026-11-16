import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";
import { Chess, type Square } from "chess.js";

test("bundled Stockfish completes UCI handshake, legal replies and new-game reset", { timeout: 30000 }, async () => {
  const engine = spawn(process.execPath, ["public/stockfish/stockfish-19-lite-single.js"], { stdio: ["pipe", "pipe", "pipe"] });
  try {
    await new Promise<void>((resolve, reject) => {
      let buffer = "";
      let stage = 0;
      let game = new Chess();
      const timer = setTimeout(() => reject(new Error("Stockfish did not complete its protocol test.")), 25000);
      function finish(error?: Error) { clearTimeout(timer); if (error) reject(error); else resolve(); }
      engine.on("error", finish);
      engine.on("exit", (code) => { if (stage < 3) finish(new Error(`Stockfish exited early (${code}).`)); });
      engine.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/); buffer = lines.pop() ?? "";
        try {
          for (const line of lines) {
            if (line === "uciok") engine.stdin.write("setoption name UCI_LimitStrength value true\nsetoption name UCI_Elo value 1400\nisready\n");
            if (line === "readyok") engine.stdin.write("position startpos\ngo depth 3\n");
            if (!line.startsWith("bestmove ")) continue;
            const move = line.split(" ")[1];
            assert.match(move, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
            assert.ok(game.move({ from: move.slice(0, 2) as Square, to: move.slice(2, 4) as Square, promotion: move[4] as "q" | undefined }));
            stage++;
            if (stage === 1) { game = new Chess(); game.move("e4"); engine.stdin.write("position startpos moves e2e4\ngo depth 3\n"); }
            else if (stage === 2) { game = new Chess(); engine.stdin.write("ucinewgame\nposition startpos\ngo depth 3\n"); }
            else finish();
          }
        } catch (error) { finish(error as Error); }
      });
      engine.stdin.write("uci\n");
    });
  } finally { engine.kill(); }
});
