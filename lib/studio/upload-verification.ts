import { StudioError } from "./authorization.ts";
import { validateUpload } from "./uploads.ts";

export function assertUploadMetadata(data: { size?: number; contentType?: string } | null, expected?: { size: number; mime: string }) {
  if (!data) throw new StudioError("This uploaded file is unavailable. Upload it again before publishing.", 409);
  try { validateUpload({ title: "Uploaded media", mime: data.contentType, size: data.size }); }
  catch { throw new StudioError("This stored file has an unsupported type or size.", 409); }
  if (expected && (Number(data.size) !== expected.size || data.contentType !== expected.mime)) throw new StudioError("Uploaded file verification failed. Check the file and retry.", 409);
}
