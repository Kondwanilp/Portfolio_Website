"use client";

import { useState, type ReactNode } from "react";

const methods = [
  { id: "culture", label: "Cell culture", project: "dorsey", title: "Molecular Toxicology" },
  { id: "protein", label: "Protein analysis", project: "dorsey", title: "Molecular Toxicology" },
  { id: "elisa", label: "ELISA", project: "douglas", title: "Environmental Biology" },
  { id: "python", label: "Python", project: "douglas", title: "Environmental Biology" },
  { id: "modeling", label: "Data modeling", project: "yang", title: "Quantum Dots & Solar Cells" },
] as const;

export default function ResearchMethods({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null);
  const method = methods.find(item => item.id === selected);
  return <div className="research-method-explorer" data-selected={selected ?? ""}>
    <div className="method-index" aria-label="Research method connections">
      <span className="section-label">Trace a method</span>
      <div className="method-options">{methods.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(current => current === item.id ? null : item.id)}>{item.label}</button>)}</div>
      <p className="method-status" role="status">{method ? <>{method.label} → <a href={`#${method.project}`}>{method.title} ↗</a></> : "Select a method to find its connection to a study."}</p>
    </div>
    {children}
  </div>;
}
