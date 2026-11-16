"use client";

import { useId } from "react";
import { clampProgress, ENERGY_PARTICLES, INNER_MEMBRANE, livingReveal, MEMBRANE_HIGHLIGHT, OUTER_MEMBRANE, particlePosition, smoothProgress, TRANSLATION_SEQUENCE, translationPhase, type LivingEdge, type LivingKind } from "@/lib/living-matter";

type Props = { kind: LivingKind; progress: number; id?: string; targetEdge?: LivingEdge };
const trnaPath = "M0 34V14C-4 6-16 9-21 0C-31-10-24-23-13-23C-4-23-7-37-15-40C-27-45-21-62-10-59C-3-57-1-48 0-44C1-48 3-57 10-59C21-62 27-45 15-40C7-37 4-23 13-23C24-23 31-10 21 0C16 9 4 6 0 14M-7 33Q0 43 7 33M-5-58L-5-75M5-58L5-75";

function Mitochondrion({ progress, id }: { progress: number; id: string }) {
  const gathering = smoothProgress(progress / .29);
  const membrane = smoothProgress((progress - .23) / .26);
  const inner = smoothProgress((progress - .30) / .21);
  const energy = smoothProgress((progress - .48) / .22);
  const reveal = livingReveal(progress, "research");
  const visibility = 1 - smoothProgress((progress - .79) / .16);
  return <>
    <defs>
      <linearGradient id={`${id}-outer`} x1=".2" y1="0" x2=".75" y2="1"><stop stopColor="#90B9AA" /><stop offset=".32" stopColor="#476F69" /><stop offset=".7" stopColor="#223E3D" /><stop offset="1" stopColor="#557F71" /></linearGradient>
      <radialGradient id={`${id}-matrix`} cx="42%" cy="38%" r="68%"><stop stopColor="#517B70" /><stop offset=".5" stopColor="#294C46" /><stop offset="1" stopColor="#152F31" /></radialGradient>
      <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D7DCAD" /><stop offset=".4" stopColor="#82A995" /><stop offset=".8" stopColor="#618C7D" /><stop offset="1" stopColor="#A4C4AE" /></linearGradient>
      <radialGradient id={`${id}-wave`}><stop stopColor="#54C8F4" stopOpacity="0" /><stop offset=".55" stopColor="#54C8F4" stopOpacity=".018" /><stop offset=".8" stopColor="#54C8F4" stopOpacity=".12" /><stop offset="1" stopColor="#54C8F4" stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-interior`}><path d={OUTER_MEMBRANE} /></clipPath>
      <filter id={`${id}-rim`} x="-10%" y="-15%" width="120%" height="130%"><feGaussianBlur stdDeviation="2.4" /></filter>
    </defs>
    <g opacity={visibility}>
      <g className="living-arrival-strokes" opacity={(1 - membrane) * gathering}>
        <path d="M72 240C153 132 224 153 310 220" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - gathering} />
        <path d="M926 399C837 508 751 449 694 396" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - gathering} />
        <path d="M837 123C778 110 744 147 710 190" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - gathering} />
      </g>
      <g className="living-energy-particles">{ENERGY_PARTICLES.map((particle, index) => {
        const position = particlePosition(index, progress);
        return <circle key={index} cx={position.x} cy={position.y} r={particle.size} opacity={position.opacity} />;
      })}</g>
      <ellipse cx="520" cy="465" rx="259" ry="21" fill="#030E10" opacity={membrane * .18} />
      <path className="living-outer-membrane" d={OUTER_MEMBRANE} fill={`url(#${id}-outer)`} fillOpacity={membrane} stroke="#B2CEC0" strokeWidth="2" strokeOpacity=".74" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - membrane} />
      <g clipPath={`url(#${id}-interior)`}>
        <path d={INNER_MEMBRANE} fill={`url(#${id}-matrix)`} fillOpacity={inner} stroke={`url(#${id}-inner)`} strokeWidth="4.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - inner} />
        <path d={INNER_MEMBRANE} fill="none" stroke="#CDDFC9" strokeWidth="1" strokeOpacity={inner * .58} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - inner} />
        <path d={INNER_MEMBRANE} fill="none" stroke="#54C8F4" strokeWidth="7" opacity={energy * .44} pathLength="1" strokeDasharray=".07 .93" strokeDashoffset={.72 - energy * .82} filter={`url(#${id}-rim)`} />
        <path d={INNER_MEMBRANE} fill="none" stroke="#AEF0EC" strokeWidth="2.2" opacity={energy * .9} pathLength="1" strokeDasharray=".06 .94" strokeDashoffset={.72 - energy * .82} />
        <path d={MEMBRANE_HIGHLIGHT} fill="none" stroke="#E5F0D9" strokeWidth="1.5" opacity={inner * .65} />
      </g>
      <path d={OUTER_MEMBRANE} fill="none" stroke="#54C8F4" strokeWidth="1.2" opacity={energy * .4} />
    </g>
    <ellipse cx="520" cy="325" rx={Math.max(1, reveal * 1130)} ry={Math.max(1, reveal * 840)} fill={`url(#${id}-wave)`} opacity={(1 - reveal) * .9} />
  </>;
}

function Translation({ progress, id, targetEdge }: { progress: number; id: string; targetEdge?: LivingEdge }) {
  const strand = smoothProgress(progress / .21);
  const assembled = smoothProgress((progress - .10) / .15);
  const phase = translationPhase(progress);
  const reveal = livingReveal(progress, "about");
  const release = smoothProgress((progress - .65) / .12);
  const unfurl = smoothProgress((progress - .74) / .23);
  const edge = targetEdge ?? { x: 740, y: 175, height: 300 };
  const edgeX = Math.max(40, Math.min(960, edge.x));
  const edgeY = Math.max(25, Math.min(550, edge.y));
  const edgeHeight = Math.max(40, Math.min(600 - edgeY, edge.height));
  const beadOffsets = [{ x: -28, y: -127 }, { x: -56, y: -153 }, { x: -37, y: -184 }, { x: -65, y: -211 }];
  const beads = beadOffsets.slice(0, phase.count).map((point, index) => {
    const x = phase.x + point.x - release * 32;
    const y = 420 + point.y - release * 35;
    return { x: x + (edgeX - x) * unfurl, y: y + (edgeY + edgeHeight * index / 3 - y) * unfurl };
  });
  const chain = beads.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const incoming = smoothProgress(phase.fraction / .42);
  const exit = smoothProgress((phase.fraction - .4) / .6);
  return <>
    <defs>
      <linearGradient id={`${id}-large`} x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#A2B8A0" /><stop offset=".45" stopColor="#60847B" /><stop offset="1" stopColor="#355B57" /></linearGradient>
      <linearGradient id={`${id}-small`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D8BC91" /><stop offset="1" stopColor="#9F7956" /></linearGradient>
    </defs>
    <g className="living-translation-body" opacity={1 - smoothProgress((progress - .76) / .17)}>
      <g transform={`translate(${(1 - strand) * -120} 0)`} opacity={strand}>
        <path className="living-mrna" d="M120 420C200 406 255 430 330 420S460 411 530 420S665 430 735 420S830 415 880 420" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - strand} />
        <text className="living-strand-end" x="110" y="454">5′</text><text className="living-strand-end" x="874" y="454">3′</text>
        {TRANSLATION_SEQUENCE.map((unit, index) => <g key={unit.codon} opacity={index === phase.codon ? 1 : .52}>
          <path className="living-codon-mark" d={`M${257 + index * 100} 414V426M${275 + index * 100} 414V426M${293 + index * 100} 414V426`} />
          <text className="living-codon" x={275 + index * 100} y="456" textAnchor="middle">{unit.codon}</text>
        </g>)}
      </g>
      <g transform={`translate(${phase.x} 420)`}>
        <path className="living-ribosome-large" d="M-105-11C-123-36-100-88-59-105C-32-139 28-146 62-119C99-119 129-86 116-52C134-21 96 2 62 1C20 14-62 9-105-11Z" transform={`translate(0 ${-95 * (1 - assembled)})`} fill={`url(#${id}-large)`} opacity={assembled} />
        <path className="living-ribosome-rim" d="M-89-22C-44-12 25-17 84-15M-71-98C-35-122 11-127 44-111" transform={`translate(0 ${-95 * (1 - assembled)})`} opacity={assembled * .7} />
        <path className="living-ribosome-small" d="M-91 17C-70 6 36 10 89 20C97 43 58 76 20 78C-32 81-78 66-91 17Z" transform={`translate(0 ${70 * (1 - assembled)})`} fill={`url(#${id}-small)`} opacity={assembled} />
        {phase.codon < 4 && <g className="living-trna" transform={`translate(${24 + (1 - incoming) * 118} ${-72 - (1 - incoming) * 120}) rotate(${(1 - incoming) * 20})`} opacity={assembled * (1 - smoothProgress((phase.fraction - .84) / .16))}>
          <path d={trnaPath} /><circle cx="0" cy="-81" r="9" fill={TRANSLATION_SEQUENCE[phase.codon].color} opacity={1 - smoothProgress((phase.fraction - .42) / .12)} />
        </g>}
        {phase.codon > 0 && phase.codon < 4 && <g className="living-trna living-trna--departing" transform={`translate(${-28 - exit * 110} ${-72 - exit * 110}) rotate(${-exit * 28})`} opacity={(1 - exit) * assembled * .75}><path d={trnaPath} /></g>}
      </g>
    </g>
    {beads.length > 0 && <g className="living-polypeptide" opacity={1 - smoothProgress((progress - .97) / .03)}>
      {phase.count > 0 && release < 1 && <path d={`M${phase.x - 28} 308L${beads[0].x} ${beads[0].y}`} strokeOpacity={1 - release} />}
      <path d={chain} strokeWidth={2.8 - unfurl} />
      {beads.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={9 - unfurl * 6} fill={TRANSLATION_SEQUENCE[index].color} />)}
    </g>}
    <path className="living-narrative-edge" d={`M${edgeX} ${edgeY}V${edgeY + edgeHeight}`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - unfurl} opacity={reveal * (1 - smoothProgress((progress - .97) / .03))} />
  </>;
}

/** A controlled decorative renderer shared by real navigation and the review lab. */
export default function LivingScene({ kind, progress, id, targetEdge }: Props) {
  const generatedId = useId();
  const sceneId = `living-${(id ?? generatedId).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const bounded = clampProgress(progress);
  return <svg className={`living-scene living-scene--${kind}`} viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-living-pose={bounded >= .5 && bounded <= .7 ? "formed" : "moving"}>
    {kind === "research" ? <Mitochondrion progress={bounded} id={sceneId} /> : <Translation progress={bounded} id={sceneId} targetEdge={targetEdge} />}
  </svg>;
}
