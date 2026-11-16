"use client";

import Image from "next/image";
import { useId, useRef, useState, type CSSProperties } from "react";
import mitochondrion from "../../public/biology/mitochondrion-figma.png";
import translation from "../../public/biology/translation-figma.png";
import { ARTWORK_HEIGHT, ARTWORK_WIDTH, BIOLOGY_DURATION_MS, PEPTIDE_SLICES, SYNTHASE_ROTORS, circleMaskPath } from "@/lib/biology";
import ScientificMotion from "./ScientificMotion";
import translationBody from "../../public/biology/translation-body-v1.png";
import translationGold from "../../public/biology/translation-trna-gold-v1.png";
import translationTeal from "../../public/biology/translation-trna-teal-v1.png";
import translationPeptide from "../../public/biology/translation-peptide-v1.png";
import translationRna from "../../public/biology/translation-rna-v1.png";

const translationTextures = [
  { name: "body", source: translationBody }, { name: "gold", source: translationGold },
  { name: "teal", source: translationTeal }, { name: "peptide", source: translationPeptide },
  { name: "rna", source: translationRna },
] as const;

type BiologyKind = "mitochondrion" | "translation";
type LayerStyle = CSSProperties & Record<`--${string}`, string | number>;
const sourceScale = `scale(${1 / ARTWORK_WIDTH} ${1 / ARTWORK_HEIGHT})`;
const fullFrame = `M0 0H${ARTWORK_WIDTH}V${ARTWORK_HEIGHT}H0Z`;

function ArtworkMasks({ id, kind }: { id: string; kind: BiologyKind }) {
  return <svg className="biology-definitions" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      {kind === "mitochondrion" && <>
        <clipPath id={`${id}-membrane`} clipPathUnits="objectBoundingBox">
          <path transform={sourceScale} clipRule="evenodd" d={fullFrame + SYNTHASE_ROTORS.map(({ x, y, radius }) => circleMaskPath(x, y, radius)).join("")} />
        </clipPath>
        {SYNTHASE_ROTORS.map(({ x, y, radius }, index) => <clipPath key={index} id={`${id}-rotor-${index}`} clipPathUnits="objectBoundingBox"><circle transform={sourceScale} cx={x} cy={y} r={radius} /></clipPath>)}
      </>}
    </defs>
  </svg>;
}

function MitochondrionLayers({ id }: { id: string }) {
  return <div className="biology-layers biology-mito-camera" aria-hidden="true">
    <div className="biology-texture biology-mito-membrane" style={{ clipPath: `url(#${id}-membrane)` }} />
    <div className="biology-membrane-light" />
    {SYNTHASE_ROTORS.map(({ x, y }, index) => {
      const coordinates: LayerStyle = { "--x": `${x / ARTWORK_WIDTH * 100}%`, "--y": `${y / ARTWORK_HEIGHT * 100}%`, "--delay": `${index % 4 * 100}ms` };
      return <div key={index} className="biology-synthase-unit" style={coordinates}>
        <div className="biology-texture biology-rotor" style={{ clipPath: `url(#${id}-rotor-${index})`, transformOrigin: `${x / ARTWORK_WIDTH * 100}% ${y / ARTWORK_HEIGHT * 100}%` }} />
        <div className="biology-proton"><i /></div>
        <div className="biology-atp"><i /></div>
      </div>;
    })}
    <div className="biology-energy-wave" />
  </div>;
}

function TranslationLayers() {
  return <div className="biology-layers biology-translation-scene" aria-hidden="true">
    <div className="biology-ribosome-travel">
      <div className="biology-texture biology-body" />
      <div className="biology-texture biology-trna-outgoing" />
      <div className="biology-texture biology-trna-incoming" />
      <div className="biology-peptide-release">
        <div className="biology-peptide-growth">
          {PEPTIDE_SLICES.map(({ x, y, left, right }, index) => <div key={index} className="biology-texture biology-amino-acid" style={{
            clipPath: `inset(0 ${(1 - right / ARTWORK_WIDTH) * 100}% 0 ${left / ARTWORK_WIDTH * 100}%)`,
            transformOrigin: `${x / ARTWORK_WIDTH * 100}% ${y / ARTWORK_HEIGHT * 100}%`,
            "--bead-delay": `${200 + index * 170}ms`,
          } as LayerStyle} />)}
        </div>
      </div>
    </div>
    <div className="biology-texture biology-rna" />
  </div>;
}

export default function BiologicalCinema({ kind }: { kind: BiologyKind }) {
  const id = `biology-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const stage = useRef<HTMLDivElement>(null);
  const loadedTextures = useRef(new Set<string>());
  const [ready, setReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const [layersFailed, setLayersFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const isMitochondrion = kind === "mitochondrion";

  function textureLoaded(name: string, source: string) {
    stage.current?.style.setProperty(`--biology-${name}`, `url("${source}")`);
    loadedTextures.current.add(name);
    if (loadedTextures.current.size === (isMitochondrion ? 1 : 6)) {
      setReady(CSS.supports("clip-path", "url(#clip)"));
    }
  }

  return <figure className={`scientific-figure scientific-figure--${kind} biology-figure`} aria-labelledby={`${id}-caption`} data-figma-node={isMitochondrion ? "2:2" : "2:3"}>
    <ScientificMotion name={`${kind}-figma-v2`} durationMs={BIOLOGY_DURATION_MS} threshold={0.4} ready={ready && !layersFailed} replay>
      <div ref={stage} className={`biology-stage biology-stage--${kind}`} data-unavailable={unavailable}>
        <ArtworkMasks id={id} kind={kind} />
        <Image className="biology-poster" src={isMitochondrion ? mitochondrion : translation}
          alt={isMitochondrion ? "Dimensional cutaway of a mitochondrion with orange outer membrane, teal cristae, and golden ATP synthase complexes" : "Dimensional ribosome with coral and sage subunits, two tRNAs, an mRNA strand, and an emerging colored polypeptide"}
          sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1200px) 85vw, 960px" quality={85}
          loading={isMitochondrion ? "eager" : "lazy"} fetchPriority={isMitochondrion ? "high" : "auto"}
          onLoad={event => {
            textureLoaded("art", event.currentTarget.currentSrc);
            setPosterReady(true);
          }} onError={() => setUnavailable(true)} />
        {posterReady && !isMitochondrion && translationTextures.map(({ name, source }) => <Image key={name}
          className="biology-preload" src={source} alt="" aria-hidden="true" sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1200px) 85vw, 960px"
          quality={85} loading="eager" onLoad={event => textureLoaded(name, event.currentTarget.currentSrc)}
          onError={() => setLayersFailed(true)} />)}
        {isMitochondrion ? <MitochondrionLayers id={id} /> : <TranslationLayers />}
        {unavailable && <p className="biology-unavailable">The illustration is unavailable. Continue below to explore {isMitochondrion ? "the research" : "my story"}.</p>}
      </div>
    </ScientificMotion>
    <figcaption id={`${id}-caption`}>{isMitochondrion
      ? "A proton gradient drives ATP synthase. ATP is produced on the matrix side of the inner mitochondrial membrane. An accelerated, illustrative sequence."
      : "The ribosome travels along mRNA, tRNAs deliver amino acids, and the growing polypeptide is released at a stop codon. mRNA is read 5′ to 3′; the peptide grows N to C. An accelerated, illustrative sequence."}</figcaption>
  </figure>;
}
