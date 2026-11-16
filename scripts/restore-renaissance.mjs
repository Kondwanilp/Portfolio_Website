import assert from "node:assert/strict";
import { createHash, createDecipheriv } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const root = path.resolve(process.env.LOCALAPPDATA, "ProjectRenaissance", "Backups");
const file = path.resolve(process.argv[2] ?? "");
const relative = path.relative(root, file);
if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Select an archive in the private backup directory.");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function report(result) {
  if (process.argv.includes("--receipt")) {
    const receipt = path.join(root, `${path.basename(file)}.${new Date().toISOString().replace(/[:.]/g, "-")}.verified.json`);
    await writeFile(receipt, JSON.stringify(result, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  }
  console.log(JSON.stringify(result));
}

async function unwrapKey(wrappedKey) {
  const command = `& ([ScriptBlock]::Create([IO.File]::ReadAllText('scripts/protect-renaissance-backup.ps1'))) -Mode UnwrapKey -File '${file.replaceAll("'", "''")}'`;
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-Command", command], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let response = "";
    child.stdout.on("data", (chunk) => { response += chunk; });
    child.stderr.resume();
    child.on("error", () => reject(new Error("Could not start Windows key recovery.")));
    child.on("close", (code) => {
      try { if (code !== 0) throw new Error(); resolve(Buffer.from(JSON.parse(response).key, "base64")); }
      catch { reject(new Error("Key recovery failed. Use the original Windows user profile and machine.")); }
    });
    child.stdin.on("error", () => undefined);
    child.stdin.end(wrappedKey);
  });
}

async function main() {
  const probe = await readFileHeader();
  if (probe.header.payloadEncoding === "jsonl") {
    await restoreStreamingSource(probe);
    return;
  }
  const archive = await readFile(file);
  const split = archive.indexOf(10);
  const header = JSON.parse(archive.subarray(0, split).toString());
  assert.equal(header.version, 1);
  assert.equal(header.algorithm, "AES-256-GCM");
  const key = await unwrapKey(header.wrappedKey);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(header.nonce, "base64"));
  decipher.setAuthTag(Buffer.from(header.tag, "base64"));
  const plain = Buffer.concat([decipher.update(archive.subarray(split + 1)), decipher.final()]);
  const payload = JSON.parse(plain.toString());
  key.fill(0); plain.fill(0);
  const restore = process.argv.includes("--restore-check");
  const destination = path.join(root, "restore-checks", `${new Date().toISOString().replace(/[:.]/g, "-")}-${payload.kind}`);
  if (restore) await mkdir(destination, { recursive: true, mode: 0o700 });
  const files = payload.kind === "source" ? payload.files : payload.kind === "media" ? payload.buckets.flatMap(({ bucket, files }) => files.map((item) => ({ ...item, path: `${bucket.id}/${item.path}` }))) : [];
  for (const item of files) {
    const target = path.resolve(destination, ...item.path.split("/"));
    if (!target.startsWith(destination + path.sep)) throw new Error("Unsafe archive path.");
    const bytes = Buffer.from(item.base64, "base64");
    assert.equal(bytes.length, item.bytes);
    assert.equal(digest(bytes), item.sha256);
    if (restore) {
      await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
      assert.equal(digest(await readFile(target)), item.sha256);
    }
  }
  if (restore && payload.kind === "media") {
    const inventory = payload.buckets.map(({ bucket, files }) => ({ bucket, files: files.map(({ path, bytes, sha256, metadata }) => ({ path, bytes, sha256, metadata })) }));
    await writeFile(path.join(destination, "RESTORE_MANIFEST.json"), JSON.stringify(inventory, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  }
  let recoveredRows = 0;
  if (payload.kind === "application-data") {
    const database = new PGlite();
    try {
      await database.exec("create table recovered_application_rows(collection text, ordinal integer, record jsonb, primary key(collection,ordinal))");
      for (const [collection, rows] of Object.entries(payload.tables)) {
        for (const [ordinal, record] of rows.entries()) {
          await database.query("insert into recovered_application_rows values($1,$2,$3::jsonb)", [collection, ordinal, JSON.stringify(record)]);
          const recovered = await database.query("select record from recovered_application_rows where collection=$1 and ordinal=$2", [collection, ordinal]);
          assert.deepEqual(recovered.rows[0].record, record);
          recoveredRows++;
        }
      }
    } finally { await database.close(); }
  }
  await report({ kind: payload.kind, archiveSha256: digest(archive), integrityVerified: true, filesVerified: files.length, recoveredApplicationRows: recoveredRows, fileRestoreChecked: restore && files.length > 0, restoreDirectory: restore && files.length ? destination : undefined, fullPostgresRestore: false });
}

async function readFileHeader() {
  const stream = createReadStream(file, { highWaterMark: 4096 });
  for await (const chunk of stream) {
    const split = chunk.indexOf(10);
    if (split < 0) throw new Error("Invalid backup header.");
    return { header: JSON.parse(chunk.subarray(0, split).toString()), start: split + 1 };
  }
  throw new Error("Empty backup.");
}

async function restoreStreamingSource({ header, start }) {
  assert.equal(header.version, 1);
  assert.equal(header.algorithm, "AES-256-GCM");
  const key = await unwrapKey(header.wrappedKey);
  function decryptedStream() {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(header.nonce, "base64"));
    decipher.setAuthTag(Buffer.from(header.tag, "base64"));
    const source = createReadStream(file, { start });
    source.on("error", (error) => decipher.destroy(error));
    return source.pipe(decipher);
  }
  // Authenticate the entire ciphertext before creating recovered files.
  for await (const chunk of decryptedStream()) { assert.ok(chunk.length); }
  const restore = process.argv.includes("--restore-check");
  const destination = path.join(root, "restore-checks", `${new Date().toISOString().replace(/[:.]/g, "-")}-source`);
  if (restore) await mkdir(destination, { recursive: true, mode: 0o700 });
  const stream = decryptedStream();
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let files = 0;
  let metadata = true;
  for await (const line of lines) {
    const item = JSON.parse(line);
    if (metadata) { assert.equal(item.kind, "source"); metadata = false; continue; }
    const target = path.resolve(destination, ...item.path.split("/"));
    if (!target.startsWith(destination + path.sep)) throw new Error("Unsafe archive path.");
    const bytes = Buffer.from(item.base64, "base64");
    assert.equal(bytes.length, item.bytes);
    assert.equal(digest(bytes), item.sha256);
    if (restore) {
      await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
      assert.equal(digest(await readFile(target)), item.sha256);
    }
    files++;
  }
  key.fill(0);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  await report({ kind: "source", archiveSha256: hash.digest("hex"), integrityVerified: true, filesVerified: files, fileRestoreChecked: restore, restoreDirectory: restore ? destination : undefined });
}

try { await main(); }
catch { console.error("Backup recovery verification failed. Private payloads and provider errors are suppressed."); process.exitCode = 1; }
