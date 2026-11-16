import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";

const url = process.env.RENAISSANCE_STAGING_URL ?? "http://127.0.0.1:55421";
assert.equal(new URL(url).origin, "http://127.0.0.1:55421");
const publishable = process.env.RENAISSANCE_STAGING_PUBLISHABLE_KEY;
const secret = process.env.RENAISSANCE_STAGING_SECRET_KEY;
if (!publishable || !secret) throw new Error("Configure the local staging keys privately before starting this server.");
const child = spawn(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", "3102"], {
  windowsHide: true,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development", NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable, SUPABASE_SECRET_KEY: secret },
});
process.on("SIGINT", () => child.kill("SIGINT"));
child.on("error", () => { console.error("Could not start the local staging application."); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
