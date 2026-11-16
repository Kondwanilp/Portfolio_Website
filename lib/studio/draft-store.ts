import { mkdir, readdir, readFile, open, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { parseDraft, type StudioDraft } from "./content.ts";
import { StudioError } from "./authorization.ts";

/** Private filesystem adapter for the local Studio workspace. */
export function createDraftStore(directory: string) {
  function file(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new StudioError("Invalid entry identifier.");
    return path.join(directory, `${id}.json`);
  }
  async function get(id: string): Promise<StudioDraft | null> {
    try { return JSON.parse(await readFile(file(id), "utf8")) as StudioDraft; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  async function list() {
    await mkdir(directory, { recursive: true });
    const names = (await readdir(directory)).filter((name) => /^[0-9a-f-]{36}\.json$/i.test(name));
    const entries = await Promise.all(names.map((name) => get(name.slice(0, -5))));
    return entries.filter((entry): entry is StudioDraft => Boolean(entry)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async function save(input: unknown, expectedRevision: number) {
    const value = parseDraft(input);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new StudioError("Invalid revision.");
    await mkdir(directory, { recursive: true });
    const target = file(value.id);
    let lock;
    try { lock = await open(`${target}.lock`, "wx"); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new StudioError("Another save is in progress. Retry in a moment.", 409);
      throw error;
    }
    const temporary = `${target}.${crypto.randomUUID()}.tmp`;
    try {
      const previous = await get(value.id);
      if ((previous?.revision ?? 0) !== expectedRevision) throw new StudioError("This entry changed in another editor. Reload it before saving.", 409);
      if (previous && previous.kind !== value.kind) throw new StudioError("An entry cannot change its content module.");
      const draft: StudioDraft = { ...value, revision: expectedRevision + 1, updatedAt: new Date().toISOString() };
      const output = await open(temporary, "wx", 0o600);
      try { await output.writeFile(JSON.stringify(draft, null, 2)); await output.sync(); } finally { await output.close(); }
      await rename(temporary, target);
      return draft;
    } finally {
      try {
        await unlink(temporary).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
      } finally {
        await lock.close();
        await unlink(`${target}.lock`);
      }
    }
  }
  return { get, list, save };
}
