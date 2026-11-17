"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { adjacentResearchFile, RESEARCH_FILES, RESEARCH_TECHNIQUES, relatedResearchFiles, researchFileFromHash, type ResearchFileId, type ResearchTechniqueId } from "./research-notebook-model";

const selectionEvent = "fieldwork:research-selection";
function subscribeSelection(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  window.addEventListener(selectionEvent, callback);
  return () => { window.removeEventListener("hashchange", callback); window.removeEventListener("popstate", callback); window.removeEventListener(selectionEvent, callback); };
}
const selectionSnapshot = () => researchFileFromHash(window.location.hash);
const serverSelection = () => "dorsey" as const;
const subscribeEnhancement = () => () => {};
const browserEnhancement = () => true;
const serverEnhancement = () => false;

export default function ResearchNotebook({ files }: { files: Array<{ id: ResearchFileId; content: ReactNode }> }) {
  const selected = useSyncExternalStore(subscribeSelection, selectionSnapshot, serverSelection);
  const enhanced = useSyncExternalStore(subscribeEnhancement, browserEnhancement, serverEnhancement);
  const [technique, setTechnique] = useState<ResearchTechniqueId | null>(null);
  const index = useRef<HTMLElement>(null);
  const current = RESEARCH_FILES.find(file => file.id === selected)!;
  const related = relatedResearchFiles(technique);
  const currentTechnique = RESEARCH_TECHNIQUES.find(item => item.id === technique);

  function selectFile(id: ResearchFileId) {
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new Event(selectionEvent));
  }
  useEffect(() => {
    if (enhanced && window.location.hash === `#${selected}`) document.getElementById(selected)?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [selected, enhanced]);

  return <div className="research-notebook" data-enhanced={enhanced}>
    <aside className="notebook-index">
      <div className="notebook-collection-heading"><span>Case files</span><span>2024–present</span></div>
      <label className="notebook-mobile-picker">Open a research file<select value={selected} onChange={event => selectFile(event.target.value as ResearchFileId)}>{RESEARCH_FILES.map(file => <option key={file.id} value={file.id}>{file.title}</option>)}</select></label>
      <nav ref={index} aria-label="Research case files" onKeyDown={event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const id = adjacentResearchFile(selected, event.key);
        selectFile(id);
        index.current?.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)?.focus({ preventScroll: true });
      }}>
        {RESEARCH_FILES.map(file => <a key={file.id} href={`#${file.id}`} aria-current={selected === file.id ? "location" : undefined} tabIndex={enhanced && selected !== file.id ? -1 : undefined} data-related={!technique || related.includes(file.id)} onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); selectFile(file.id);
        }}>
          <span className="notebook-file-icon" aria-hidden="true"><svg viewBox="0 0 24 28"><path d="M4 2h10l6 6v18H4Z M14 2v7h6 M8 14h8 M8 18h8 M8 22h5" /></svg><span>{file.number}</span></span>
          <span className="notebook-file-name"><strong>{file.title}</strong><span>{file.discipline}</span><small>{file.period}</small></span>
        </a>)}
      </nav>
      <div className="notebook-techniques">
        <p className="notebook-label" id="technique-label">Follow a technique</p>
        <div role="group" aria-labelledby="technique-label">{RESEARCH_TECHNIQUES.map(item => <button type="button" key={item.id} aria-pressed={technique === item.id} onClick={() => setTechnique(value => value === item.id ? null : item.id)}>{item.label}</button>)}</div>
        <p className="notebook-technique-status" role="status">{currentTechnique ? <>{currentTechnique.label} connects {related.map((id, position) => <span key={id}>{position > 0 ? " and " : ""}<a href={`#${id}`} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); selectFile(id); }}>{RESEARCH_FILES.find(file => file.id === id)!.title}</a></span>)}.</> : "Choose a technique to trace its connection to the work."}</p>
      </div>
      <p className="notebook-index-note">Questions, approaches, and evidence from my undergraduate research.</p>
    </aside>
    <div className="notebook-reading-pane">
      <div className="notebook-document-toolbar"><span><span aria-hidden="true">↳ </span>Research / {current.number}</span><span>{current.period}</span></div>
      <p className="notebook-selection-status sr-only" role="status">Selected research file: {current.title}.</p>
      {files.map(file => <details key={file.id} id={file.id} className="notebook-file" data-active={selected === file.id} open>
        <summary className="notebook-file-summary">{RESEARCH_FILES.find(item => item.id === file.id)!.title}</summary>
        {file.content}
      </details>)}
      <div className="notebook-document-footer"><span>Research notebook / Kondwani Phiri</span><a href="/gallery">Photographic field notes <span aria-hidden="true">↗</span></a></div>
    </div>
  </div>;
}
