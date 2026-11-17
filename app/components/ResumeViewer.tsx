"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask, TextLayer } from "pdfjs-dist";
import FloatingWindow from "./FloatingWindow";
import { clampViewerPage, clampViewerZoom, fitViewerScale, type ViewerFit } from "@/lib/viewer-model";

const PDF_ASSETS = "/pdfjs/6.5.438/";

export default function ResumeViewer({ onClose }: { onClose: () => void }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [fit, setFit] = useState<ViewerFit>(() => window.innerWidth < 700 ? "width" : "page");
  const [zoom, setZoom] = useState(1);
  const [actualZoom, setActualZoom] = useState(1);
  const [error, setError] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [area, setArea] = useState({ width: 600, height: 650 });
  const viewport = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let loading: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    void import("pdfjs-dist").then(pdfjs => {
      if (disposed) return;
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_ASSETS + "pdf.worker.min.mjs";
      loading = pdfjs.getDocument({ url: "/cv.pdf", disableWorkerRendering: true, useWasm: false, useSystemFonts: true, enableXfa: false });
      return loading.promise.then(document => {
        if (!disposed) setPdf(document);
      });
    }).catch(() => { if (!disposed) { setError(true); setRendering(false); } });
    return () => { disposed = true; void loading?.destroy(); };
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setArea({ width: Math.max(160, entry.contentRect.width - 48), height: Math.max(200, entry.contentRect.height - 48) }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !sheet.current || error) return;
    let cancelled = false;
    let render: RenderTask | undefined;
    let text: TextLayer | undefined;
    const host = sheet.current;
    void (async () => {
      setRendering(true);
      const pdfPage = await pdf.getPage(clampViewerPage(page, pdf.numPages));
      if (cancelled) return;
      const natural = pdfPage.getViewport({ scale: 1 });
      const scale = fit === "custom" ? clampViewerZoom(zoom) : fitViewerScale(natural, area, fit);
      const bounds = pdfPage.getViewport({ scale });
      const density = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (bounds.width * bounds.height)));
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(bounds.width * density); canvas.height = Math.floor(bounds.height * density);
      canvas.style.width = `${bounds.width}px`; canvas.style.height = `${bounds.height}px`;
      canvas.setAttribute("aria-hidden", "true");
      const textContainer = document.createElement("div");
      textContainer.className = "pdf-text-layer";
      textContainer.setAttribute("role", "document");
      textContainer.setAttribute("aria-label", `Résumé, page ${page}`);
      host.style.width = `${bounds.width}px`; host.style.height = `${bounds.height}px`;
      host.style.setProperty("--total-scale-factor", String(scale));
      // A fresh canvas per render keeps cancellation/rapid zoom from sharing a painting surface.
      host.replaceChildren(canvas, textContainer);
      render = pdfPage.render({ canvas, viewport: bounds, transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0] });
      const painting = render.promise;
      // Cleanup can cancel painting before text loading completes. Observe it immediately.
      void painting.catch(() => {});
      const pdfjs = await import("pdfjs-dist");
      const content = await pdfPage.getTextContent();
      if (cancelled) return;
      text = new pdfjs.TextLayer({ textContentSource: content, container: textContainer, viewport: bounds });
      await Promise.all([painting, text.render()]);
      if (!cancelled) { setActualZoom(scale); setRendering(false); }
    })().catch(failure => {
      if (!cancelled && failure?.name !== "RenderingCancelledException") { setError(true); setRendering(false); }
    });
    return () => { cancelled = true; render?.cancel(); text?.cancel(); };
  }, [pdf, page, fit, zoom, area, error]);

  function changeZoom(delta: number) { setZoom(current => clampViewerZoom((fit === "custom" ? current : actualZoom) + delta)); setFit("custom"); }
  return <FloatingWindow title="Résumé" subtitle="Kondwani Phiri / cv.pdf" onClose={onClose} className="resume-window" toolbar={<>
    <div className="viewer-tool-group"><button type="button" disabled={!pdf || error || actualZoom <= .25} onClick={() => changeZoom(-.25)} aria-label="Zoom out">−</button><output aria-label="Document magnification">{Math.round(actualZoom * 100)}%</output><button type="button" disabled={!pdf || error || actualZoom >= 4} onClick={() => changeZoom(.25)} aria-label="Zoom in">+</button></div>
    <label className="viewer-fit"><span className="sr-only">Fit document</span><select aria-label="Fit document" value={fit} disabled={!pdf || error} onChange={event => setFit(event.target.value as ViewerFit)}><option value="page">Fit page</option><option value="width">Fit width</option><option value="custom">Custom zoom</option></select></label>
    {pdf && <div className="viewer-tool-group viewer-pagination">{pdf.numPages > 1 && <button type="button" disabled={page <= 1} onClick={() => setPage(value => clampViewerPage(value - 1, pdf.numPages))} aria-label="Previous page">‹</button>}<span>Page {page} of {pdf.numPages}</span>{pdf.numPages > 1 && <button type="button" disabled={page >= pdf.numPages} onClick={() => setPage(value => clampViewerPage(value + 1, pdf.numPages))} aria-label="Next page">›</button>}</div>}
    <div className="viewer-document-actions"><a href="/cv.pdf" download="Kondwani-Phiri-CV.pdf">Download</a><a href="/cv.pdf" target="_blank" rel="noopener noreferrer">Open original <span aria-hidden="true">↗</span></a></div>
  </>}>
    <div ref={viewport} className="pdf-viewport" tabIndex={0} role="region" aria-label="Résumé document. Scroll to move around a magnified page.">
      {error ? <div className="viewer-fallback"><h2>Open the original document.</h2><p>The in-site renderer is unavailable in this browser. Your résumé is still available to view or download.</p><a href="/cv.pdf" target="_blank" rel="noopener noreferrer">View PDF in a new tab ↗</a><a href="/cv.pdf" download="Kondwani-Phiri-CV.pdf">Download PDF</a></div> : <div className="pdf-sheet" ref={sheet} />}
    </div>
    <p className="viewer-document-status" role="status">{error ? "PDF fallback available." : !pdf ? "Loading the original PDF…" : rendering ? `Rendering page ${page}…` : `Page ${page} of ${pdf.numPages}. Selectable document text is available.`}</p>
  </FloatingWindow>;
}
