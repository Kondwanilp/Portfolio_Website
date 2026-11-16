export const BIOLOGY_DURATION_MS = 2700;
export const ARTWORK_WIDTH = 1536;
export const ARTWORK_HEIGHT = 1024;

// Coordinates refer to the original Figma artwork, never to viewport pixels.
export const SYNTHASE_ROTORS = [
  { x: 388, y: 253, radius: 12 },
  { x: 598, y: 275, radius: 12 },
  { x: 741, y: 360, radius: 11 },
  { x: 908, y: 453, radius: 11 },
  { x: 1033, y: 467, radius: 11 },
  { x: 1136, y: 522, radius: 11 },
  { x: 564, y: 540, radius: 12 },
  { x: 804, y: 653, radius: 12 },
] as const;

export const PEPTIDE_BEADS = [
  { x: 792, y: 273, radius: 42 }, { x: 825, y: 222, radius: 41 },
  { x: 885, y: 214, radius: 39 }, { x: 941, y: 204, radius: 38 },
  { x: 987, y: 179, radius: 42 }, { x: 1033, y: 129, radius: 42 },
  { x: 1102, y: 117, radius: 44 }, { x: 1165, y: 94, radius: 43 },
  { x: 1233, y: 79, radius: 45 },
] as const;

// Contiguous bands preserve every pixel of the transparent peptide layer at rest.
export const PEPTIDE_SLICES = PEPTIDE_BEADS.map((bead, index) => ({
  ...bead,
  left: index === 0 ? 0 : (PEPTIDE_BEADS[index - 1].x + bead.x) / 2,
  right: index === PEPTIDE_BEADS.length - 1 ? ARTWORK_WIDTH : (bead.x + PEPTIDE_BEADS[index + 1].x) / 2,
}));

export function circleMaskPath(x: number, y: number, radius: number) {
  return `M${x + radius} ${y}a${radius} ${radius} 0 1 0 ${-radius * 2} 0a${radius} ${radius} 0 1 0 ${radius * 2} 0Z`;
}
