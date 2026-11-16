import type { SupabaseClient } from "@supabase/supabase-js";
import { StudioError } from "./authorization.ts";
import type { StudioDraft } from "./content.ts";

export type StoredDraft = StudioDraft & { archivedAt: string | null; deletedAt: string | null; publishedRevision: number | null };
export type StudioRevision = { revision: number; snapshot: StudioDraft; created_at: string };
type DatabaseError = { code?: string; message: string };

export function databaseFailure(error: DatabaseError): never {
  if (["42P01", "42883", "42703", "PGRST202", "PGRST204", "PGRST205"].includes(error.code ?? "")) throw new StudioError("Studio database setup is awaiting migration approval. Existing portfolio content is available.", 503);
  if (error.code === "40001" || error.code === "23505") throw new StudioError("This entry changed or its slug is already in use. Reload the collection before retrying.", 409);
  if (error.code === "42501") throw new StudioError("Owner authorization is required.", 403);
  if (error.code === "P0001") throw new StudioError("This operation is unavailable. Save a complete draft, check media, and reload before retrying.", 409);
  throw new StudioError("The database could not complete this request. Your editor content is still available. Please retry.", 503);
}

export function createStudioRepository(client: SupabaseClient) {
  async function list(): Promise<StoredDraft[]> {
    const { data, error } = await client.from("studio_entries").select("document, archived_at, deleted_at, studio_publications(revision)").order("updated_at", { ascending: false });
    if (error) databaseFailure(error);
    return (data ?? []).map((row) => {
      const publication = Array.isArray(row.studio_publications) ? row.studio_publications[0] : row.studio_publications;
      return { ...row.document, archivedAt: row.archived_at, deletedAt: row.deleted_at, publishedRevision: publication?.revision ?? null };
    });
  }
  async function get(id: string): Promise<StoredDraft | null> {
    const { data: row, error } = await client.from("studio_entries").select("document, archived_at, deleted_at, studio_publications(revision)").eq("id", id).maybeSingle();
    if (error) databaseFailure(error);
    if (!row) return null;
    const publication = Array.isArray(row.studio_publications) ? row.studio_publications[0] : row.studio_publications;
    return { ...row.document, archivedAt: row.archived_at, deletedAt: row.deleted_at, publishedRevision: publication?.revision ?? null };
  }
  async function save(entry: Omit<StudioDraft, "revision" | "updatedAt">, revision: number) {
    if (!Number.isSafeInteger(revision) || revision < 0) throw new StudioError("Choose a valid saved revision.");
    const { data, error } = await client.rpc("studio_save_draft", { p_document: entry, p_expected_revision: revision });
    if (error) databaseFailure(error);
    return data as StudioDraft;
  }
  async function history(id: string): Promise<StudioRevision[]> {
    const { data, error } = await client.from("studio_revisions").select("revision,snapshot,created_at").eq("entry_id", id).order("revision", { ascending: false }).limit(100);
    if (error) databaseFailure(error);
    return data ?? [];
  }
  async function transition(id: string, revision: number, action: string, restoreRevision: number | null = null) {
    const { data, error } = await client.rpc("studio_transition", { p_entry_id: id, p_expected_revision: revision, p_action: action, p_restore_revision: restoreRevision });
    if (error) databaseFailure(error);
    return data;
  }
  return { list, get, save, history, transition };
}
