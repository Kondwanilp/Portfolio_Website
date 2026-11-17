import type { ReactNode } from "react";
import type { WorkspaceIconName } from "@/lib/public-navigation";

const drawings: Record<WorkspaceIconName, ReactNode> = {
  welcome: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M3 9h18M9 9v12" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
  research: <><path d="M7 3v6l-4 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-4-9V3M5 3h10M5 15h10M17 4h4v17" /><path d="m8 17 1-1m3 3 1-1" /></>,
  experience: <><path d="M6 3v18M10 6h11M10 12h8M10 18h11" /><circle cx="6" cy="6" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="6" cy="18" r="2" /></>,
  leadership: <><circle cx="8" cy="7" r="3" /><circle cx="18" cy="9" r="2.5" /><path d="M2 21v-2a6 6 0 0 1 12 0v2M15 15a5 5 0 0 1 7 5" /></>,
  photos: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8" cy="9" r="1.6" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
  journal: <><path d="M6 3h12a2 2 0 0 1 2 2v16H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM7 3v18M11 8h5M11 12h5" /></>,
  music: <><path d="M9 18V6l11-3v12M9 10l11-3" /><ellipse cx="6" cy="18" rx="3" ry="2" /><ellipse cx="17" cy="15" rx="3" ry="2" /></>,
  chess: <path d="m7 17 2-5-5 1 1-5 5-5h5l-1 3c5 3 6 7 4 11M7 17h11l1 4H5zM10 8h.01" />,
  basketball: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18M5.6 5.6c7 1 11.8 5.8 12.8 12.8M18.4 5.6c-7 1-11.8 5.8-12.8 12.8" /></>,
  collections: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M8 5V3h8v2" /></>,
};

export default function WorkspaceIcon({ name, className = "" }: { name: WorkspaceIconName; className?: string }) {
  return <svg className={`workspace-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{drawings[name]}</svg>;
}
