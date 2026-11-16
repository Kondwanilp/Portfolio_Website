import { supabase } from "./supabase/client";
import { COURT_VIDEO_BUCKET, type CourtVideo, type HoopSession } from "./court-vision";
import { changeVideoPublication, type VideoGateway } from "./video-lifecycle";

export { PORTFOLIO_OWNER_ID as COURT_OWNER_ID } from "./owner";
import { PORTFOLIO_OWNER_ID as COURT_OWNER_ID } from "./owner";
const videoColumns = "id, title, description, played_on, location, storage_path, is_published, created_at";

export async function requireCourtOwner() {
  const { data, error } = await supabase.auth.getUser();
  if (error || data.user?.id !== COURT_OWNER_ID) throw new Error("Your owner session has expired. Please sign in again.");
  return data.user;
}

export async function loadCourtDashboard(signal: AbortSignal) {
  const [sessions, videos] = await Promise.all([
    supabase.from("hoop_sessions").select("id, played_on, location").order("played_on", { ascending: false }).abortSignal(signal),
    supabase.from("court_videos").select(videoColumns).order("created_at", { ascending: false }).abortSignal(signal),
  ]);
  if (sessions.error || videos.error) throw new Error("Could not load the dashboard. Please try again.");
  return { sessions: sessions.data as HoopSession[], videos: videos.data as CourtVideo[] };
}

export function createVideoGateway(signal = AbortSignal.timeout(20_000)): VideoGateway {
  return {
    async find(id) {
      const { data, error } = await supabase.from("court_videos").select(videoColumns).eq("id", id).abortSignal(signal).maybeSingle();
      if (error) throw new Error("Could not check the saved video. Please retry.");
      return data as CourtVideo | null;
    },
    async insert(draft) {
      const { error } = await supabase.from("court_videos").insert(draft).select("id").abortSignal(signal).single();
      if (error) throw new Error("Could not save video details.");
    },
    async setPublished(video, published) {
      const { data, error } = await supabase.from("court_videos").update({ is_published: published })
        .eq("id", video.id).eq("storage_path", video.storage_path).eq("is_published", video.is_published)
        .select("id").abortSignal(signal).maybeSingle();
      if (error || !data) throw new Error("The video changed or access was denied. Refresh the library and retry.");
    },
    async removeFile(path) {
      const { error } = await supabase.storage.from(COURT_VIDEO_BUCKET).remove([path]);
      if (error) throw new Error("Could not remove the file. The video is retained as a draft so deletion can be retried.");
    },
    async deleteDraft(video) {
      const { data, error } = await supabase.from("court_videos").delete().eq("id", video.id)
        .eq("storage_path", video.storage_path).eq("is_published", false).select("id").abortSignal(signal).maybeSingle();
      if (error) throw new Error("The file was removed. Retry deletion to remove its remaining draft record.");
      if (!data && await this.find(video.id)) throw new Error("The record changed during deletion. Refresh the library before continuing.");
    },
  };
}

export async function videoFileExists(path: string, expectedSize?: number) {
  const { data, error } = await supabase.storage.from(COURT_VIDEO_BUCKET).info(path);
  if (error) {
    if (String(error.statusCode) === "404") return false;
    // Supabase's legacy storage API reports a missing object as status 400/404.
    if (error.message.toLowerCase().includes("not found")) return false;
    throw new Error("Could not verify the stored file. Please retry.");
  }
  if (expectedSize !== undefined && Number(data.size) !== expectedSize) throw new Error("The stored file size differs from the selected video.");
  return true;
}

export async function publishCourtVideo(video: CourtVideo) {
  await requireCourtOwner();
  await changeVideoPublication(createVideoGateway(), video, videoFileExists);
}
