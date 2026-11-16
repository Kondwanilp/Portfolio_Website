import * as tus from "tus-js-client";
import { supabase } from "./supabase/client";
import { COURT_VIDEO_BUCKET } from "./court-vision";
import { validateVideoFile } from "./video-lifecycle";

export type UploadIdentity = { id: string; path: string; fingerprint: string };
let pendingIdentity: UploadIdentity | undefined;

export function uploadIdentity(file: File, ownerId: string): UploadIdentity {
  const { extension } = validateVideoFile(file);
  const fingerprint = `${ownerId}:${file.name}:${file.size}:${file.lastModified}`;
  const key = `court-upload:${fingerprint}`;
  if (pendingIdentity?.fingerprint === fingerprint) return pendingIdentity;
  let saved: string | null = null;
  try { saved = localStorage.getItem(key); } catch { /* Current-tab retries remain available without browser storage. */ }
  if (saved) {
    try {
      const entry = JSON.parse(saved) as UploadIdentity;
      if (entry.fingerprint === fingerprint && /^[0-9a-f-]{36}$/.test(entry.id) && entry.path === `court-videos/${entry.id}.${extension}`) {
        pendingIdentity = entry;
        return entry;
      }
    } catch { /* Replace an invalid local upload journal. */ }
  }
  const id = crypto.randomUUID();
  const identity = { id, path: `court-videos/${id}.${extension}`, fingerprint };
  pendingIdentity = identity;
  try { localStorage.setItem(key, JSON.stringify(identity)); } catch { /* Retain the identity in memory for current-tab retries. */ }
  return identity;
}

export function forgetUpload(identity: UploadIdentity) {
  pendingIdentity = undefined;
  try { localStorage.removeItem(`court-upload:${identity.fingerprint}`); } catch { /* The saved database ID makes a later retry idempotent. */ }
}

export async function uploadCourtVideo(file: File, identity: UploadIdentity, signal: AbortSignal, progress: (value: number) => void) {
  const { contentType } = validateVideoFile(file);
  const projectUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const endpoint = `https://${projectUrl.hostname.split(".")[0]}.storage.supabase.co/storage/v1/upload/resumable`;
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let requestTimeout: ReturnType<typeof setTimeout> | undefined;
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      clearTimeout(requestTimeout);
      signal.removeEventListener("abort", pause);
      if (error) reject(error);
      else resolve();
    }
    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      fingerprint: async () => `court-video:${identity.fingerprint}:${identity.path}`,
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      metadata: { bucketName: COURT_VIDEO_BUCKET, objectName: identity.path, contentType, cacheControl: "3600" },
      async onBeforeRequest(request) {
        if (signal.aborted) throw new Error("Upload paused. Select the same file to resume.");
        if (new URL(request.getURL()).origin !== new URL(endpoint).origin) throw new Error("The saved upload URL is invalid.");
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw new Error("Please sign in again to resume your upload.");
        request.setHeader("Authorization", `Bearer ${data.session.access_token}`);
        clearTimeout(requestTimeout);
        requestTimeout = setTimeout(() => {
          void upload.abort().finally(() => finish(new Error("The upload request timed out. Retry to resume.")));
        }, 60_000);
      },
      onAfterResponse() { clearTimeout(requestTimeout); },
      onShouldRetry(error) {
        const status = error.originalResponse?.getStatus() ?? 0;
        return !signal.aborted && (status === 0 || status === 408 || status === 423 || status === 429 || status >= 500);
      },
      onProgress(sent, total) { if (!settled) progress(total ? Math.round(sent / total * 100) : 0); },
      onError() { finish(new Error("The upload was interrupted. Retry with the same file to resume.")); },
      onSuccess() { finish(); },
    });
    function pause() {
      void upload.abort().finally(() => finish(new Error("Upload paused. Select the same file to resume.")));
    }
    signal.addEventListener("abort", pause, { once: true });
    if (signal.aborted) { pause(); return; }
    void upload.findPreviousUploads().then((previous) => {
      if (settled || signal.aborted) return;
      const match = previous.find(({ metadata, uploadUrl }) => metadata.objectName === identity.path && metadata.bucketName === COURT_VIDEO_BUCKET && uploadUrl?.startsWith(`${new URL(endpoint).origin}/storage/v1/upload/resumable/`));
      if (match) upload.resumeFromPreviousUpload(match);
      upload.start();
    }).catch(() => finish(new Error("Could not restore the upload. Check browser storage and retry.")));
  });
}
