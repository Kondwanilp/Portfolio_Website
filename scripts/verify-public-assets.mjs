import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3101";
const root = path.resolve("public");
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(file);
    return /\.(jpe?g|png|webp|pdf|mp4|webm)$/i.test(entry.name) ? [file] : [];
  }));
  return nested.flat();
}
const files = await collect(root);
assert.ok(files.length, "Portfolio media must be present");
for (let offset = 0; offset < files.length; offset += 4) {
  await Promise.all(files.slice(offset, offset + 4).map(async (file) => {
    const relative = path.relative(root, file).split(path.sep).map(encodeURIComponent).join("/");
    const response = await fetch(`${base}/${relative}`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, relative);
    assert.equal(Number(response.headers.get("content-length")), (await stat(file)).size, relative);
  }));
}
console.log(JSON.stringify({ publicMediaVerified: files.length, method: "HEAD", contentBytesDownloaded: 0 }));
