export const RESEARCH_FILES = [
  { id: "dorsey", number: "01", title: "Molecular Toxicology", discipline: "Cellular responses", supervisor: "Dr. Waneene Dorsey", period: "2025–present" },
  { id: "douglas", number: "02", title: "Environmental & Developmental Biology", discipline: "Seabird physiology", supervisor: "Dr. Hector Douglas III", period: "2025–present" },
  { id: "yang", number: "03", title: "Quantum Dots & Solar Cells", discipline: "Materials & light", supervisor: "Dr. Yang Haeyeon", period: "Fall 2024" },
] as const;

export type ResearchFileId = (typeof RESEARCH_FILES)[number]["id"];
export const RESEARCH_TECHNIQUES = [
  { id: "culture", label: "Cell culture", files: ["dorsey"] },
  { id: "protein", label: "Protein analysis", files: ["dorsey"] },
  { id: "elisa", label: "ELISA", files: ["douglas"] },
  { id: "python", label: "Python", files: ["douglas"] },
  { id: "analysis", label: "Data analysis", files: ["douglas", "yang"] },
  { id: "modeling", label: "Data modeling", files: ["yang"] },
] as const satisfies ReadonlyArray<{ id: string; label: string; files: readonly ResearchFileId[] }>;
export type ResearchTechniqueId = (typeof RESEARCH_TECHNIQUES)[number]["id"];

export function researchFileFromHash(hash: string): ResearchFileId {
  const id = hash.replace(/^#/, "");
  return RESEARCH_FILES.find(file => file.id === id)?.id ?? "dorsey";
}

export function relatedResearchFiles(technique: string | null): ResearchFileId[] {
  const selected = RESEARCH_TECHNIQUES.find(item => item.id === technique);
  return selected ? [...selected.files] : RESEARCH_FILES.map(file => file.id);
}

export function adjacentResearchFile(current: ResearchFileId, key: string): ResearchFileId {
  const index = RESEARCH_FILES.findIndex(file => file.id === current);
  if (key === "Home") return RESEARCH_FILES[0].id;
  if (key === "End") return RESEARCH_FILES[RESEARCH_FILES.length - 1].id;
  const step = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
  return RESEARCH_FILES[(index + step + RESEARCH_FILES.length) % RESEARCH_FILES.length].id;
}
