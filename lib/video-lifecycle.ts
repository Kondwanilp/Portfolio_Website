export const MAX_VIDEO_SIZE = 45 * 1024 * 1024;

export function validateVideoFile(file: { name: string; size: number; type: string }) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "mp4" && extension !== "mov") throw new Error("Please choose an MP4 or MOV video.");
  if (file.size <= 0 || file.size > MAX_VIDEO_SIZE) throw new Error("Choose a nonempty video of up to 45 MB.");
  const contentType = extension === "mov" ? "video/quicktime" : "video/mp4";
  if (file.type && file.type !== contentType) throw new Error("The video type does not match its file extension.");
  return { extension, contentType };
}

export type VideoDraft = {
  id: string;
  storage_path: string;
  title: string;
  description: string | null;
  location: string;
  played_on: string;
  is_published: false;
};

export function validateVideoDetails(details: Pick<VideoDraft, "title" | "location" | "played_on">) {
  if (!details.title.trim() || !details.location.trim()) throw new Error("Please complete the title, date, and location.");
  const date = new Date(`${details.played_on}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.played_on) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== details.played_on) {
    throw new Error("Please choose a valid date.");
  }
}

export type StoredVideo = { id: string; storage_path: string; is_published: boolean };
export type VideoGateway = {
  find: (id: string) => Promise<StoredVideo | null>;
  insert: (draft: VideoDraft) => Promise<void>;
  setPublished: (video: StoredVideo, published: boolean) => Promise<void>;
  removeFile: (path: string) => Promise<void>;
  deleteDraft: (video: StoredVideo) => Promise<void>;
};

/** A failed/ambiguous insert is reconciled by the stable upload ID. */
export async function saveVideoDraft(gateway: VideoGateway, draft: VideoDraft) {
  validateVideoDetails(draft);
  const existing = await gateway.find(draft.id);
  if (existing) {
    if (existing.storage_path !== draft.storage_path) throw new Error("This upload ID belongs to a different file.");
    return;
  }
  try {
    await gateway.insert(draft);
  } catch {
    const saved = await gateway.find(draft.id);
    if (saved?.storage_path === draft.storage_path) return;
    throw new Error("The file is retained. Retry saving this upload to recover its video details.");
  }
}

/** Keep the draft row as the recovery reference until storage deletion succeeds. */
export async function deleteCourtVideo(gateway: VideoGateway, id: string) {
  const video = await gateway.find(id);
  if (!video) return;
  if (video.is_published) await gateway.setPublished(video, false);
  await gateway.removeFile(video.storage_path);
  await gateway.deleteDraft({ ...video, is_published: false });
}

export async function changeVideoPublication(gateway: VideoGateway, video: StoredVideo, fileExists: (path: string) => Promise<boolean>) {
  const current = await gateway.find(video.id);
  if (!current || current.storage_path !== video.storage_path || current.is_published !== video.is_published) {
    throw new Error("The video changed. Refresh the library before publishing.");
  }
  if (!current.is_published && !await fileExists(current.storage_path)) {
    throw new Error("This upload is incomplete. Resume it before publishing.");
  }
  await gateway.setPublished(current, !current.is_published);
}
