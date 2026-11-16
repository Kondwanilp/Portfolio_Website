import { isLivingKind, type LivingKind } from "./living-matter.ts";
export type LabView = "cover" | LivingKind;
export const isMotionLabEnabled = (environment: string | undefined) => environment === "development";
export function readLabView(search: string): LabView {
  const view = new URLSearchParams(search).get("view") ?? "";
  return isLivingKind(view) ? view : "cover";
}
