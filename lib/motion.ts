export const MOTION_DURATION_MS = 2400;
export const MOTION_SESSION_VERSION = "renaissance-motion-v1";
export function shouldPlayMotion(reducedMotion: boolean, played: boolean) {
  return !reducedMotion && !played;
}
/** Illustrative mRNA, 5′ to 3′. Anticodons are written 3′ to 5′. */
export const TRANSLATION = [
  { codon: "AUG", anticodon: "UAC", aminoAcid: "Met" },
  { codon: "GCU", anticodon: "CGA", aminoAcid: "Ala" },
  { codon: "UUU", anticodon: "AAA", aminoAcid: "Phe" },
  { codon: "GGA", anticodon: "CCU", aminoAcid: "Gly" },
  { codon: "UAA", anticodon: null, aminoAcid: null },
] as const;
