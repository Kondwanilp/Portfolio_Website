import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve(".studio/staging/supabase");
const configPath = path.join(directory, "config.toml");
let config = await readFile(configPath, "utf8");
assert.match(config, /project_id = "(?:staging|renaissance-local)"/);
config = config.replace(/project_id = "staging"/, 'project_id = "renaissance-local"');
config = config.replace(/\b5432([0-9])\b/g, "5542$1");
config = config.replace(/jwt_expiry = \d+/, "jwt_expiry = 60");
config = config.replaceAll("http://127.0.0.1:3000", "http://127.0.0.1:3102").replaceAll("http://localhost:3000", "http://127.0.0.1:3102");
config = config.replace(/(\[db.seed\][\s\S]*?)enabled = true/, "$1enabled = false");
config = config.replace(/(\[analytics\][\s\S]*?)enabled = true/, "$1enabled = false");
await writeFile(configPath, config);
await mkdir(path.join(directory, "migrations"), { recursive: true });
const manifest = JSON.parse(await readFile("docs/STUDIO_MIGRATION_REVIEW.json", "utf8"));
for (const migration of manifest.migrations) {
  const bytes = await readFile(migration.path);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), migration.sha256);
  const target = path.join(directory, "migrations", path.basename(migration.path));
  let exists = true;
  try { await access(target); } catch { exists = false; }
  if (exists) assert.deepEqual(await readFile(target), bytes);
  else await writeFile(target, bytes, { flag: "wx" });
}
console.log(JSON.stringify({ localDirectory: ".studio/staging", apiPort: 55421, databasePort: 55422, applicationPort: 3102, migrationCopiesVerified: manifest.migrations.length, hostedProjectLinked: false }));
