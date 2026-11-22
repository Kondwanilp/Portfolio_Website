"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useLabJourney } from "./LabJourney";

const specimens = [
  { label: "About", href: "/about", liquid: "#8bb7a7" },
  { label: "Research", href: "/research", liquid: "#e7b468" },
  { label: "Experience", href: "/experience", liquid: "#b9a2c9" },
  { label: "Leadership", href: "/leadership", liquid: "#e5a194" },
  { label: "Journal", href: "/journal", liquid: "#91c0bb" },
  { label: "Extras", href: "/extras", liquid: "#edc976" },
] as const;

type Phase = "idle" | "selected" | "sampling" | "dispensed" | "zooming";

function QuietCells({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 210 150" aria-hidden="true" fill="none">
      <g stroke="#859b83" strokeWidth="1.25">
        <ellipse cx="65" cy="81" rx="37" ry="28" transform="rotate(-14 65 81)" fill="#bed1b6" fillOpacity=".48" />
        <ellipse cx="147" cy="39" rx="36" ry="27" transform="rotate(17 147 39)" fill="#b9c9ad" fillOpacity=".47" />
        <ellipse cx="131" cy="113" rx="25" ry="19" transform="rotate(-20 131 113)" fill="#bcd0b8" fillOpacity=".48" />
      </g>
      <ellipse cx="65" cy="81" rx="12" ry="10" fill="#87a795" fillOpacity=".48" />
      <ellipse cx="148" cy="39" rx="11" ry="9" fill="#91ac97" fillOpacity=".48" />
      <ellipse cx="130" cy="114" rx="8" ry="6" fill="#87a795" fillOpacity=".48" />
      <circle cx="193" cy="48" r="4" fill="#98b09b" /><circle cx="184" cy="76" r="3" fill="#98b09b" />
    </svg>
  );
}

function Microscope() {
  return (
    <svg className="kw-scope-svg" viewBox="0 0 340 440" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kw-scope-ivory" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffdf6" /><stop offset="1" stopColor="#ded5c5" />
        </linearGradient>
        <linearGradient id="kw-scope-sage" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#779683" /><stop offset="1" stopColor="#486c5d" />
        </linearGradient>
      </defs>
      <ellipse cx="190" cy="415" rx="130" ry="10" fill="#6c66562c" />
      <path d="M194 117C277 132 316 215 276 326L246 326C274 249 260 186 204 168Z" fill="url(#kw-scope-sage)" stroke="#678272" strokeWidth="3" />
      <path d="M201 151C261 179 277 238 257 307" stroke="#afc6ae" strokeWidth="4" opacity=".55" />
      <path d="M98 359Q111 340 146 340H265Q300 347 315 392Q313 412 284 415H79Q50 410 56 390Q65 368 98 359Z" fill="url(#kw-scope-ivory)" stroke="#b9b09e" strokeWidth="2" />
      <path d="M75 398H299" stroke="#d2c6b4" strokeWidth="5" />
      <rect x="78" y="408" width="34" height="9" rx="4" fill="#4c554b" />
      <rect x="262" y="408" width="35" height="9" rx="4" fill="#4c554b" />
      <rect x="123" y="339" width="82" height="20" rx="9" fill="#d7d0c2" stroke="#9f9789" />
      <ellipse cx="165" cy="340" rx="35" ry="10" fill="#496c5d" stroke="#889e8b" strokeWidth="4" />
      <path d="M98 279H290L302 296H90Z" fill="#727b71" stroke="#525e55" strokeWidth="2" />
      <rect x="98" y="275" width="196" height="13" rx="3" fill="#858f82" stroke="#555f55" strokeWidth="2" />
      <rect x="131" y="290" width="28" height="40" rx="6" fill="#dad3c8" stroke="#aaa291" />
      <rect x="190" y="290" width="28" height="34" rx="5" fill="#535d54" />
      <g transform="translate(175 130) rotate(29)">
        <rect x="-42" y="-99" width="84" height="164" rx="15" fill="url(#kw-scope-ivory)" stroke="#b0a898" strokeWidth="3" />
        <rect x="-41" y="-116" width="82" height="34" rx="11" fill="#515b55" stroke="#3c453e" strokeWidth="3" />
        <rect x="-30" y="-82" width="60" height="10" rx="5" fill="#eee6d6" />
        <rect x="-40" y="51" width="80" height="30" rx="12" fill="#d2c9b9" stroke="#948b7d" strokeWidth="3" />
        <rect x="-53" y="81" width="106" height="32" rx="12" fill="#d9d4c6" stroke="#a8a193" strokeWidth="3" />
        <rect x="-38" y="110" width="29" height="55" rx="9" fill="#f2e9d8" stroke="#aaa291" strokeWidth="3" />
        <rect x="8" y="110" width="29" height="49" rx="9" fill="#eee2d0" stroke="#aaa291" strokeWidth="3" />
        <ellipse cx="-24" cy="163" rx="14" ry="6" fill="#515d53" />
        <ellipse cx="22" cy="157" rx="14" ry="6" fill="#515d53" />
      </g>
      <circle cx="272" cy="315" r="30" fill="#cfc5b2" stroke="#9f9380" strokeWidth="4" />
      <circle cx="272" cy="315" r="20" fill="#e7dccc" stroke="#b1a38e" strokeWidth="2" />
      <circle cx="272" cy="315" r="9" fill="#b6ab96" />
    </svg>
  );
}

function Pipette() {
  return (
    <svg viewBox="0 0 265 65" aria-hidden="true" fill="none">
      <rect x="1" y="19" width="53" height="25" rx="11" fill="#608273" stroke="#4b695b" strokeWidth="1.5" />
      <rect x="30" y="11" width="26" height="41" rx="7" fill="#88a99a" stroke="#597a6c" strokeWidth="1.5" />
      <rect x="52" y="16" width="136" height="31" rx="10" fill="#f7f2e9" stroke="#9fa695" strokeWidth="1.5" />
      <path d="M72 21H160" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity=".82" />
      <rect x="182" y="22" width="23" height="20" rx="5" fill="#7ca093" stroke="#608073" strokeWidth="1.5" />
      <path d="M202 25H221L261 32L221 39H202Z" fill="#deebe6" stroke="#809e92" strokeWidth="1.5" />
    </svg>
  );
}

/** All specimen destinations share one pipette and route-reveal choreography. */
export default function LabBenchHome() {
  const { navigate } = useLabJourney();
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [drop, setDrop] = useState("#8bb7a7");
  const busy = useRef(false);
  const vialRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pipetteRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const motion = useRef<Animation | null>(null);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    motion.current?.cancel();
  }, []);

  function choose(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (busy.current) { event.preventDefault(); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();

    const vial = vialRefs.current[index]?.getBoundingClientRect();
    const pipette = pipetteRef.current?.getBoundingClientRect();
    const slide = slideRef.current?.getBoundingClientRect();
    const scope = scopeRef.current?.getBoundingClientRect();
    const destination = specimens[index].href;
    if (!vial || !pipette || !slide || !scope || !pipetteRef.current?.animate) {
      navigate(destination);
      return;
    }
    busy.current = true;
    setSelected(index);
    setDrop(specimens[index].liquid);
    setPhase("selected");
    const mobile = window.innerWidth <= 700;
    const travelMs = mobile ? 1000 : 1780;
    const leadMs = mobile ? 100 : 260;
    const tipX = pipette.left + pipette.width * .96;
    const tipY = pipette.top + pipette.height * .5;
    const vialX = vial.left + vial.width / 2 - tipX;
    const vialY = vial.top + vial.height * .32 - tipY;
    const slideX = slide.left + slide.width * .5 - tipX;
    const slideY = slide.top + slide.height * .2 - tipY;
    const wait = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    wait(() => setPhase("sampling"), leadMs);
    wait(() => {
      motion.current = pipetteRef.current?.animate([
        { transform: "translate3d(0,0,0) rotate(0deg)", offset: 0 },
        { transform: `translate3d(${vialX}px,${vialY - 48}px,0) rotate(28deg)`, offset: .22 },
        { transform: `translate3d(${vialX}px,${vialY}px,0) rotate(28deg)`, offset: .38 },
        { transform: `translate3d(${vialX}px,${vialY - 35}px,0) rotate(28deg)`, offset: .51 },
        { transform: `translate3d(${slideX}px,${slideY - 35}px,0) rotate(21deg)`, offset: .73 },
        { transform: `translate3d(${slideX}px,${slideY}px,0) rotate(21deg)`, offset: .87 },
        { transform: `translate3d(${slideX}px,${slideY - 26}px,0) rotate(21deg)`, offset: 1 },
      ], { duration: travelMs, easing: "cubic-bezier(.38,.08,.23,1)", fill: "forwards" }) ?? null;
    }, leadMs);
    wait(() => setPhase("dispensed"), leadMs + travelMs * .88);
    wait(() => {
      setPhase("zooming");
      navigate(destination, "enter", { x: scope.left + scope.width / 2, y: scope.top + scope.height / 2 });
    }, leadMs + travelMs + (mobile ? 40 : 140));
  }

  return (
    <section className={`kw-home kw-home--${phase}`} aria-labelledby="kw-heading">
      <header className="kw-intro">
        <p className="kw-eyebrow">Lusaka roots. Grambling days.</p>
        <h1 id="kw-heading">Kondwani’s<br /><em>World.</em></h1>
        <p className="kw-instruction"><span aria-hidden="true" className="kw-instruction-marker">⌕</span> Pick a vial to analyze it.</p>
      </header>
      <QuietCells className="kw-soft-cells" />
      <div className="kw-workbench">
        <div className="kw-bench-surface" aria-hidden="true" />
        <nav className="kw-rack" aria-label="Choose a specimen to explore">
          <div className="kw-rack-back" aria-hidden="true" />
          <div className="kw-rack-vials">
            {specimens.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                ref={node => { vialRefs.current[i] = node; }}
                className={`kw-vial-link ${selected === i ? "kw-vial-link--selected" : ""}`}
                style={{ "--liquid": item.liquid } as CSSProperties}
                aria-label={`Analyze ${item.label} — open ${item.label} section`}
                onClick={event => choose(event, i)}
              >
                <span className="kw-vial" aria-hidden="true">
                  <span className="kw-vial-cap" />
                  <span className="kw-vial-neck" />
                  <span className="kw-vial-glass"><span className="kw-vial-fluid" /><span className="kw-vial-highlight" /></span>
                </span>
                <span className="kw-rack-label">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="kw-rack-base" aria-hidden="true" />
        </nav>
        <div className="kw-microscope">
          <Microscope />
          <div className="kw-eyepiece-target" ref={scopeRef} />
        </div>
        <div className="kw-pipette" ref={pipetteRef}><Pipette /></div>
        <div className="kw-slide" ref={slideRef} aria-hidden="true">
          <span className="kw-slide-drop" style={{ "--drop": drop } as CSSProperties} />
        </div>
      </div>
      <p className="sr-only" role="status">{selected === null ? "Choose a vial to explore a section" : `Analyzing ${specimens[selected].label}`}</p>
    </section>
  );
}
