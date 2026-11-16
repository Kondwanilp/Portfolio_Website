"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import LivingStage from "../components/LivingStage";
import { LIVING_DURATION, LIVING_KINDS, type LivingKind, type LivingEdge } from "@/lib/living-matter";
import { runLivingTimeline } from "@/lib/living-timeline";
import { readLabView } from "@/lib/motion-lab";
import { advanceSectionVisit, type SectionVisit } from "@/lib/living-viewport";

const reviewPaths: Record<LivingKind | "cover", string> = { cover: "/", research: "/research", about: "/about", experience: "/experience", leadership: "/leadership", journal: "/journal", listening: "/extras/listening", chess: "/extras/chess", basketball: "/extras/basketball", extras: "/extras" };
export default function MotionLaboratory() {
  const [view, setView] = useState<"cover" | LivingKind>("research");
  const [progress, setProgress] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [width, setWidth] = useState(1440);
  const [presentation, setPresentation] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ready, setReady] = useState(false);
  const [targetEdge, setTargetEdge] = useState<LivingEdge | undefined>();
  const frame = useRef<HTMLIFrameElement>(null);
  const timeline = useRef<ReturnType<typeof runLivingTimeline> | null>(null);
  const height = 800;
  const kind = view === "cover" ? "research" : view;
  function measureEdge() {
    const portrait = frame.current?.contentDocument?.querySelector("[data-living-portrait]")?.getBoundingClientRect();
    const scale = Math.min(width / 1000, height / 650);
    setTargetEdge(portrait ? { x: (portrait.right - (width - 1000 * scale) / 2) / scale, y: (portrait.top - (height - 650 * scale) / 2) / scale, height: portrait.height / scale } : undefined);
  }
  function stop() { timeline.current?.cancel(); timeline.current = null; setPlaying(false); }
  function reveal() { stop(); setProgress(1); }
  function replay() {
    stop();
    measureEdge();
    if (view === "cover" || reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setProgress(1); return; }
    setProgress(0); setPlaying(true);
    timeline.current = runLivingTimeline(setProgress, () => { setPlaying(false); timeline.current = null; }, LIVING_DURATION / speed);
  }
  useEffect(() => {
    const requested = readLabView(window.location.search);
    // Query hydration is an external URL subscription, not a hidden navigation animation.
    const timer = window.setTimeout(() => {
      setView(requested);
    }, 0);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => { timeline.current?.cancel(); timeline.current = null; setPlaying(false); setProgress(1); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") settle(); };
    const visibility = () => { if (document.hidden) settle(); };
    media.addEventListener("change", settle);
    document.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    return () => { clearTimeout(timer); timeline.current?.cancel(); media.removeEventListener("change", settle); document.removeEventListener("keydown", key); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  function choose(next: typeof view) {
    reveal(); setView(next); setReady(false);
    window.history.replaceState(null, "", `/motion-lab?view=${next}`);
  }
  const restartOnEntry = useEffectEvent(() => replay());
  useEffect(() => {
    const viewport = frame.current?.contentWindow;
    if (!ready || !viewport) return;
    let last = viewport.scrollY;
    let visit: SectionVisit = { inside: true, entered: 0 };
    let pending = 0;
    function check() {
      pending = 0;
      const target = frame.current?.contentDocument?.querySelector("[data-living-destination]");
      if (!target) return;
      const result = advanceSectionVisit(visit, target.getBoundingClientRect(), viewport!.innerHeight, performance.now());
      visit = result.state;
      if (result.action === "exit") timeline.current?.complete();
      else if (result.action === "enter" && !timeline.current) restartOnEntry();
      else if (result.action === "wait") pending = requestAnimationFrame(check);
    }
    const scroll = () => {
      const delta = viewport.scrollY - last; last = viewport.scrollY;
      timeline.current?.addScroll(delta, performance.now());
      if (!pending) pending = requestAnimationFrame(check);
    };
    viewport.addEventListener("scroll", scroll, { passive: true });
    return () => { viewport.removeEventListener("scroll", scroll); cancelAnimationFrame(pending); };
  }, [ready, view]);
  return <main id="main-content" className={presentation ? "motion-laboratory motion-laboratory--presentation" : "motion-laboratory"}>
    <header className="lab-toolbar"><div><p>Project Renaissance / Development only</p><h1>Living Matter.</h1></div><Link href="/">Return to portfolio &#8599;</Link></header>
    <div className="lab-workspace">
      <aside className="lab-controls" aria-label="Motion review controls">
        <p className="lab-label">One approved direction</p><p>Warm editorial reading. Archival precision. Biological information becoming a personal story.</p>
        <fieldset><legend>Actual destination</legend><div className="lab-destinations">{(["cover", ...LIVING_KINDS] as const).map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => choose(item)}>{item === "cover" ? "Home" : item === "research" ? "Research" : "About"}</button>)}</div></fieldset>
        <label>Viewport<select value={width} onChange={event => { reveal(); setWidth(Number(event.target.value)); }}><option value={320}>320px / narrow mobile</option><option value={390}>390px / mobile</option><option value={768}>768px / tablet</option><option value={1440}>1440px / desktop</option><option value={1920}>1920px / wide desktop</option></select></label>
        <label>Playback<select value={speed} onChange={event => { reveal(); setSpeed(Number(event.target.value)); }}><option value={1}>1x / 2.5 seconds</option><option value={.75}>0.75x / slow study</option><option value={1.5}>1.5x / quick study</option></select></label>
        <label className="lab-check"><input type="checkbox" checked={reduced} onChange={event => { reveal(); setReduced(event.target.checked); }} />Reduced-motion preview</label>
        <label>Freeze / scrub <output>{Math.round(progress * 100)}%</output><input type="range" min="0" max="100" step="1" value={Math.round(progress * 100)} disabled={view === "cover" || reduced} onChange={event => { stop(); setProgress(Number(event.target.value) / 100); }} /></label>
        <div className="lab-keyframes">{[[.27, "Formation"], [.60, "Full anatomy"], [.72, "Release"], [1, "Destination"]].map(([value, label]) => <button key={label} type="button" disabled={view === "cover" || reduced} onClick={() => { stop(); measureEdge(); setProgress(Number(value)); }}>{label}</button>)}</div>
        <p className="lab-note">The frame contains the real website and uses its shared adaptive controller. Replay, then scroll inside the page to adjust speed. Leaving and reentering the signature section allows replay. At 60%, inspect the full organelle; at 72%, inspect peptide release.</p>
      </aside>
      <section className="lab-review" aria-label="Living Matter interactive review">
        <div className="lab-review-bar"><span>{view === "cover" ? "Homepage" : view === "research" ? "Research / Cellular energy" : view === "about" ? "About / Information becomes identity" : view[0].toUpperCase() + view.slice(1)}</span><div><button type="button" disabled={view === "cover" || !ready} onClick={replay}>Replay</button><button type="button" onClick={reveal}>Skip</button><button type="button" onClick={() => setPresentation(current => !current)}>{presentation ? "Show controls" : "Presentation mode"}</button></div></div>
        <p className="lab-status" role="status">{!ready ? "Loading actual destination..." : playing ? "Transition playing. Escape or Skip reveals the destination." : progress < 1 ? `Frozen at ${Math.round(progress * 100)}%.` : "Destination ready. No entrance on direct load."}</p>
        <div className="lab-scroll"><div className="lab-canvas" style={{ width, height }}>
          <iframe key={view} ref={frame} title={`Actual ${view} portfolio page`} src={reviewPaths[view]} data-living-review="true" onLoad={() => setReady(true)} />
          {view !== "cover" && progress < 1 && !reduced && <LivingStage kind={kind} progress={progress} width={width} height={height} targetEdge={targetEdge} />}
        </div></div>
      </section>
    </div>
  </main>;
}
