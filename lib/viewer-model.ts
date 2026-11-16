export type ViewerFit = "page" | "width" | "custom";
export function clampViewerZoom(value: number) { return Number.isFinite(value) ? Math.max(.25, Math.min(4, value)) : 1; }
export function clampViewerPage(value: number, count: number) { const pages = Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1; return Math.max(1, Math.min(pages, Number.isFinite(value) ? Math.floor(value) : 1)); }
export function fitViewerScale(page: { width: number; height: number }, area: { width: number; height: number }, mode: "page" | "width") {
  if (page.width <= 0 || page.height <= 0 || area.width <= 0 || area.height <= 0) return 1;
  const width = area.width / page.width;
  return clampViewerZoom(mode === "width" ? width : Math.min(width, area.height / page.height));
}

type ViewerDialog = { open: boolean; showModal: () => void; close: () => void };
type ViewerFocusTarget = { isConnected: boolean; focus: (options: { preventScroll: boolean }) => void };
export function mountViewerDialog(dialog: ViewerDialog, previous: ViewerFocusTarget | null) {
  if (!dialog.open) dialog.showModal();
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    if (dialog.open) dialog.close();
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  };
}
