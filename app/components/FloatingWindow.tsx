"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { mountViewerDialog } from "@/lib/viewer-model";

type Props = { title: string; subtitle?: string; children: ReactNode; onClose: () => void; className?: string; toolbar?: ReactNode };

/** Native modal semantics, focus containment and one shared window treatment. */
export default function FloatingWindow({ title, subtitle, children, onClose, className = "", toolbar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closing = useRef<Animation | null>(null);
  const [expanded, setExpanded] = useState(false);
  const labelId = useId();
  useEffect(() => {
    const dialog = ref.current;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && typeof dialog.showModal === "function") {
      const dispose = mountViewerDialog(dialog, previousFocus.current);
      const openedLocation = window.location.href;
      // Fragment navigation can emit both popstate and hashchange for the same URL.
      const leaveDocument = () => { if (window.location.href !== openedLocation && dialog.open) dialog.close(); };
      window.addEventListener("popstate", leaveDocument);
      window.addEventListener("hashchange", leaveDocument);
      return () => { window.removeEventListener("popstate", leaveDocument); window.removeEventListener("hashchange", leaveDocument); const animation = closing.current; closing.current = null; animation?.cancel(); dispose(); };
    }
  }, []);
  function close() {
    const dialog = ref.current;
    if (!dialog || closing.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof dialog.animate !== "function") { dialog.close(); return; }
    try {
      const style = getComputedStyle(dialog);
      const animation = dialog.animate([{ opacity: style.opacity, transform: style.transform }, { opacity: 0, transform: "translateY(8px) scale(.99)" }], { duration: 140, easing: "ease-out", fill: "forwards" });
      closing.current = animation;
      const settle = () => { if (closing.current === animation && dialog.isConnected && dialog.open) dialog.close(); };
      void animation.finished.then(settle, settle).finally(() => { if (closing.current === animation) closing.current = null; });
    } catch { dialog.close(); }
  }
  return <dialog ref={ref} className={`exhibition-window ${expanded ? "exhibition-window--expanded" : ""} ${className}`} aria-labelledby={labelId} onClose={() => { if (ref.current && !ref.current.open) onClose(); }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="exhibition-window-panel">
      <header className="exhibition-window-titlebar">
        <div className="exhibition-window-title"><strong id={labelId}>{title}</strong>{subtitle && <span>{subtitle}</span>}</div>
        <div className="exhibition-window-controls">
          <button type="button" aria-label={expanded ? "Restore window size" : "Expand window"} aria-pressed={expanded} onClick={() => setExpanded(value => !value)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d={expanded ? "M7 3v4H3m10 10v-4h4M7 7 3 3m10 10 4 4" : "M3 7V3h4m6 14h4v-4M3 3l5 5m9 9-5-5"} /></svg></button>
          <button type="button" autoFocus aria-label={`Close ${title}`} onClick={close}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
        </div>
      </header>
      {toolbar && <div className="exhibition-window-toolbar" role="toolbar" aria-label={`${title} controls`}>{toolbar}</div>}
      <div className="exhibition-window-content">{children}</div>
    </div>
  </dialog>;
}
