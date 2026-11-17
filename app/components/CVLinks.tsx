"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ResumeLoadBoundary from "./ResumeLoadBoundary";

const ResumeViewer = dynamic(() => import("./ResumeViewer"), { ssr: false, loading: () => <p className="viewer-opening" role="status">Opening résumé…</p> });

export default function CVLinks({ available, compact = false }: { available: boolean; compact?: boolean }) {
  const [opened, setOpened] = useState(false);
  return <span className={`cv-links ${compact ? "cv-links--compact" : ""}`}>
    {available ? <><a href="/cv.pdf" aria-haspopup="dialog" onClick={event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof HTMLDialogElement === "undefined" || typeof HTMLDialogElement.prototype.showModal !== "function") return;
      event.preventDefault(); setOpened(true);
    }}>View Résumé <span aria-hidden="true">↗</span></a></> : <span className="cv-pending">CV · PDF pending</span>}
    {opened && <ResumeLoadBoundary onClose={() => setOpened(false)}><ResumeViewer onClose={() => setOpened(false)} /></ResumeLoadBoundary>}
  </span>;
}
