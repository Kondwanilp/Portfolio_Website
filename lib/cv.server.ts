import "server-only";
import { statSync } from "node:fs";
import path from "node:path";

export function hasPublicCv() {
  const file = statSync(path.join(process.cwd(), "public", "cv.pdf"), { throwIfNoEntry: false });
  return Boolean(file?.isFile() && file.size > 0);
}
