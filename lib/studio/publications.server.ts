import "server-only";
import { boundedFetch } from "./transport";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type { StudioDraft } from "./content";
export type Publication = Omit<StudioDraft, "media"> & { media: { id: string; title: string; url: string; type: string; alt: string }[] };

export function publicStudioClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: boundedFetch(10000) },
  });
}

export async function publishedEntries(): Promise<Publication[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("studio-publications");
  const { data, error } = await publicStudioClient().from("studio_publications").select("content").order("published_at", { ascending: false });
  // Before approved activation, source-controlled portfolio pages remain the baseline.
  if (error) {
    if (!["42P01", "PGRST205"].includes(error.code)) console.error("Studio publication read unavailable", { code: error.code });
    return [];
  }
  return (data ?? []).map((row) => row.content as Publication);
}
