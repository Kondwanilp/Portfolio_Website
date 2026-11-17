"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { collectionForPath } from "@/lib/public-navigation";

export default function WorkspaceToolbar({ menu, resume }: { menu: ReactNode; resume: ReactNode }) {
  const pathname = usePathname();
  const collection = collectionForPath(pathname);
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) { if (event.target instanceof Node && !details.current?.contains(event.target) && details.current) details.current.open = false; }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <header className="v3-toolbar">
    <details ref={details} className="v3-mobile-collections" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
      <summary aria-label="Browse collections"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M13 8h4M13 12h4M13 16h4" /></svg><span>Collections</span></summary>
      <div className="v3-mobile-source-list">{menu}</div>
    </details>
    <div className="v3-toolbar-location" aria-label="Current collection"><span className="v3-toolbar-section">{collection.group === "workbench" ? "Workbench" : "Off duty"}</span><span className="v3-toolbar-separator" aria-hidden="true">/</span><strong>{collection.label}</strong></div>
    <div className="v3-toolbar-actions">{resume}</div>
  </header>;
}
