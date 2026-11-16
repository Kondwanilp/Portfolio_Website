import ScientificMotion from "./ScientificMotion";
import BiologicalCinema from "./BiologicalCinema";

type Motif = "mitochondrion" | "translation" | "neuron" | "mitosis" | "pulse" | "branches";
type SchematicMotif = Exclude<Motif, "mitochondrion" | "translation">;
const captions: Record<SchematicMotif, string> = {
  neuron: "Connections take shape. A schematic neuron and the paths an impulse can travel.",
  mitosis: "Alignment, separation, and two daughter cells. A simplified view of mitosis and cytokinesis.",
  pulse: "A change of rhythm. An illustrative ECG trace for life outside the laboratory.",
  branches: "Ideas branch, connect, and grow. An abstract botanical study.",
};
function Drawing({ motif }: { motif: SchematicMotif }) {
  switch (motif) {
    case "neuron": return <>
      <path className="draw-line" d="M35 45L85 99L53 141L104 144L116 196L154 166L182 188L176 145L211 129L177 107L191 68L150 88L113 48L115 102L85 99M53 141L26 170M35 45L52 27M113 48L92 23M116 196L100 229M182 188L206 222M211 129C282 115 340 137 420 128L475 81M420 128L490 161M420 128L477 123M475 81L506 63M490 161L512 195" />
      <circle cx="140" cy="127" r="15" /><path className="impulse" d="M207 128C280 115 343 137 419 128L489 161" /><text x="279" y="188">CONNECTIONS IN MOTION</text>
    </>;
    case "mitosis": return <>
      <ellipse className="draw-line" cx="112" cy="135" rx="65" ry="78" /><path d="M67 135L108 95L153 135L112 170Z" />
      {[105,128,151].map(y => <path key={y} d={`M105 ${y-5}L118 ${y+5}M118 ${y-5}L105 ${y+5}`} />)}
      <path className="division-arrow" d="M199 135H251M241 126L251 135L241 144" />
      <path className="draw-line" d="M352 73C290 34 258 113 293 148C257 204 321 243 351 199C395 240 453 193 417 148C453 90 397 32 352 73Z" />
      <g className="daughter-left">{[105,140,175].map(y => <path key={y} d={`M324 ${y-7}L310 ${y}L324 ${y+7}`} />)}</g>
      <g className="daughter-right">{[105,140,175].map(y => <path key={y} d={`M384 ${y-7}L398 ${y}L384 ${y+7}`} />)}</g>
      <path className="secondary-line" d="M352 78Q330 140 352 196" /><text x="54" y="243">ALIGNMENT</text><text x="285" y="264">SEPARATION · CYTOKINESIS</text>
    </>;
    case "pulse": return <><path className="secondary-line" d="M20 130H540M20 90H540M20 170H540" /><path className="draw-line ecg" d="M20 130H95Q105 110 118 130H158L174 143L192 50L213 208L231 111L244 130H299Q328 91 349 130H540" /><circle className="energy-particles" cx="540" cy="130" r="5" /><text x="28" y="231">THE RHYTHM OUTSIDE RESEARCH</text></>;
    case "branches": return <><path className="draw-line" d="M82 240Q213 137 473 40M198 159Q139 70 126 38M198 159Q287 191 384 196M308 102Q314 58 288 24M366 77Q423 109 501 103" /><path className="draw-line secondary-line" d="M140 92Q96 103 77 73Q120 62 140 92ZM294 185Q310 220 351 224Q343 190 294 185ZM326 65Q350 26 390 32Q370 65 326 65ZM420 101Q445 142 481 137Q468 104 420 101Z" /></>;
  }
}
export default function ScientificFigure({ motif }: { motif: Motif }) {
  if (motif === "mitochondrion" || motif === "translation") return <BiologicalCinema kind={motif} />;
  return <figure className={`scientific-figure scientific-figure--${motif}`}>
    <ScientificMotion name={motif}><svg viewBox="0 0 560 280" role="img" aria-label={`${motif} schematic`}><Drawing motif={motif} /></svg></ScientificMotion>
    <figcaption>{captions[motif]}</figcaption>
  </figure>;
}
