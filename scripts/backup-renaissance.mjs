import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readFile, readdir, writeFile, open } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

if (process.platform !== "win32") throw new Error("This backup uses Windows CurrentUser DPAPI.");
const kind = process.argv[2];
let projectUrl;
let client;
if (kind !== "source") {
  process.loadEnvFile(".env.local");
  projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (new URL(projectUrl).hostname !== "zpdebvrdourervijfnpd.supabase.co") throw new Error("Confirm the portfolio project before backing up.");
  client = createClient(projectUrl, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(60000) }) },
  });
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(process.env.LOCALAPPDATA, "ProjectRenaissance", "Backups");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function protectKey(mode, encoded, file) {
  return new Promise((resolve, reject) => {
    const command = `& ([ScriptBlock]::Create([IO.File]::ReadAllText('scripts/protect-renaissance-backup.ps1'))) -Mode ${mode} -File '${file.replaceAll("'", "''")}'`;
    const child = spawn("powershell.exe", ["-NoProfile", "-Command", command], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    // Provider data and process stderr must never be echoed into the conversation.
    child.stderr.resume();
    child.on("error", () => reject(new Error("Could not start private backup encryption.")));
    child.on("close", (code) => {
      if (code !== 0) reject(new Error("Private backup encryption failed. Check local permissions and PowerShell execution policy."));
      else { try { resolve(JSON.parse(output)); } catch { reject(new Error("Backup verification returned an invalid result.")); } }
    });
    child.stdin.on("error", () => undefined);
    child.stdin.end(encoded);
  });
}

async function encrypt(kind, payload) {
  const file = path.join(destination, `${stamp}-${kind}.rbackup`);
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const plain = Buffer.from(JSON.stringify(payload));
  const { wrappedKey } = await protectKey("WrapKey", key.toString("base64"), file);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const header = { version: 1, algorithm: "AES-256-GCM", keyProtection: "Windows-DPAPI-CurrentUser", wrappedKey, nonce: nonce.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
  await writeFile(file, Buffer.concat([Buffer.from(JSON.stringify(header) + "\n"), ciphertext]), { flag: "wx", mode: 0o600 });
  const saved = await readFile(file);
  const split = saved.indexOf(10);
  const metadata = JSON.parse(saved.subarray(0, split).toString());
  const unwrapped = await protectKey("UnwrapKey", metadata.wrappedKey, file);
  const restoredKey = Buffer.from(unwrapped.key, "base64");
  const decipher = createDecipheriv("aes-256-gcm", restoredKey, Buffer.from(metadata.nonce, "base64"));
  decipher.setAuthTag(Buffer.from(metadata.tag, "base64"));
  const restored = Buffer.concat([decipher.update(saved.subarray(split + 1)), decipher.final()]);
  if (digest(restored) !== digest(plain)) throw new Error("Encrypted backup integrity verification failed.");
  key.fill(0); restoredKey.fill(0); restored.fill(0); plain.fill(0);
  console.log(JSON.stringify({ kind, verified: true, file, encryptedBytes: saved.length, sha256: digest(saved) }));
}

async function sourceFiles(directory, relative = "") {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw new Error("Review source symlinks before backup.");
    const name = relative ? `${relative}/${item.name}` : item.name;
    if (item.isDirectory()) {
      if (["node_modules", ".next"].includes(item.name)) continue;
      result.push(...await sourceFiles(path.join(directory, item.name), name));
    } else if (item.isFile()) result.push(name);
  }
  return result.sort();
}

async function backupSource() {
  const file = path.join(destination, `${stamp}-source.rbackup`);
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const { wrappedKey } = await protectKey("WrapKey", key.toString("base64"), file);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const header = { version: 1, algorithm: "AES-256-GCM", keyProtection: "Windows-DPAPI-CurrentUser", payloadEncoding: "jsonl", wrappedKey, nonce: nonce.toString("base64"), tag: Buffer.alloc(16).toString("base64") };
  const placeholder = Buffer.from(JSON.stringify(header) + "\n");
  const handle = await open(file, "wx", 0o600);
  const manifest = [];
  const names = await sourceFiles(process.cwd());
  try {
    await handle.writeFile(placeholder);
    await handle.writeFile(cipher.update(JSON.stringify({ version: 1, kind: "source", createdAt: stamp, omitted: ["node_modules", ".next"] }) + "\n"));
    for (const name of names) {
      const bytes = await readFile(name);
      const item = { path: name, bytes: bytes.length, sha256: digest(bytes) };
      manifest.push(item);
      await handle.writeFile(cipher.update(JSON.stringify({ ...item, base64: bytes.toString("base64") }) + "\n"));
    }
    await handle.writeFile(cipher.final());
    header.tag = cipher.getAuthTag().toString("base64");
    const completedHeader = Buffer.from(JSON.stringify(header) + "\n");
    if (completedHeader.length !== placeholder.length) throw new Error("Backup header length changed.");
    await handle.write(completedHeader, 0, completedHeader.length, 0);
    await handle.sync();
  } finally { await handle.close(); key.fill(0); }
  if (JSON.stringify(names) !== JSON.stringify(await sourceFiles(process.cwd()))) throw new Error("Source inventory changed during backup.");
  for (const item of manifest) if (digest(await readFile(item.path)) !== item.sha256) throw new Error("Source changed during backup. Retry after edits finish.");
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  console.log(JSON.stringify({ kind: "source", file, sourceFiles: manifest.length, sourceBytes: manifest.reduce((sum, item) => sum + item.bytes, 0), sha256: hash.digest("hex"), verificationRequired: "Run restore-renaissance.mjs against this archive" }));
}

async function rows(table) {
  const result = [];
  for (let offset = 0; ; offset += 500) {
    const response = await client.from(table).select("*").order("id").range(offset, offset + 499);
    if (response.error) throw new Error("Application data export failed. Provider details suppressed.");
    result.push(...response.data);
    if (response.data.length < 500) return result;
  }
}

async function backupApplicationData() {
  const tables = {};
  for (const table of ["court_videos", "hoop_sessions", "spotify_tokens"]) tables[table] = await rows(table);
  for (const table of Object.keys(tables)) if (JSON.stringify(tables[table]) !== JSON.stringify(await rows(table))) throw new Error("Application data changed during export. Retry at a quiet time.");
  const schema = await fetch(`${projectUrl}/rest/v1/`, { headers: { apikey: process.env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` }, signal: AbortSignal.timeout(15000) });
  if (!schema.ok) throw new Error("Application API schema export failed.");
  await encrypt("application-data", { version: 1, kind: "application-data", project: "zpdebvrdourervijfnpd", createdAt: stamp, consistentRead: "two matching reads, without a database snapshot", tables, apiSchema: await schema.json(), fullPostgresDump: false, requiredAdditionalCoverage: ["Auth records and sessions", "database roles, grants, policies and complete schema", "project/provider configuration"] });
  console.log(JSON.stringify({ applicationRows: Object.fromEntries(Object.entries(tables).map(([name, values]) => [name, values.length])) }));
}

async function listObjects(bucket, prefix = "") {
  const objects = [];
  for (let offset = 0; ; offset += 100) {
    const result = await client.storage.from(bucket).list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (result.error) throw new Error("Storage inventory failed.");
    for (const item of result.data) {
      const name = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id) objects.push(...await listObjects(bucket, name));
      else objects.push({ ...item, path: name });
    }
    if (result.data.length < 100) return objects;
  }
}

async function backupMedia() {
  const inventory = await client.storage.listBuckets();
  if (inventory.error) throw new Error("Bucket inventory failed.");
  const buckets = [];
  for (const bucket of inventory.data) {
    const before = await listObjects(bucket.id);
    const files = [];
    for (const item of before) {
      const object = await client.storage.from(bucket.id).download(item.path);
      if (object.error) throw new Error("Media download failed.");
      const bytes = Buffer.from(await object.data.arrayBuffer());
      if (item.metadata?.size !== undefined && Number(item.metadata.size) !== bytes.length) throw new Error("Media size changed during backup.");
      files.push({ path: item.path, sha256: digest(bytes), bytes: bytes.length, metadata: item.metadata, base64: bytes.toString("base64") });
    }
    if (JSON.stringify(before) !== JSON.stringify(await listObjects(bucket.id))) throw new Error("Storage inventory changed during backup.");
    buckets.push({ bucket, files });
  }
  await encrypt("media", { version: 1, kind: "media", project: "zpdebvrdourervijfnpd", createdAt: stamp, buckets });
  console.log(JSON.stringify({ buckets: buckets.length, mediaFiles: buckets.reduce((sum, item) => sum + item.files.length, 0) }));
}

try {
  if (kind === "source") await backupSource();
  else if (kind === "application-data") await backupApplicationData();
  else if (kind === "media") await backupMedia();
  else throw new Error("Choose source, application-data, or media.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Backup failed.");
  process.exitCode = 1;
}
