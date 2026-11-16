import type { ReactNode } from "react";

export default function StudioField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="studio-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
