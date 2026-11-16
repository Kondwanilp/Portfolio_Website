import type { ReactNode, SVGProps } from "react";

const paths = {
  basketball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5.6 5.6c7 1 11.8 5.8 12.8 12.8M18.4 5.6c-7 1-11.8 5.8-12.8 12.8" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 10 6-3v10l-6-3" />
    </>
  ),
  pawn: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M8 10h8M10 10c0 5-1 6-3 8h10c-2-2-3-3-3-8M6 21h12" />
    </>
  ),
  knight: <path d="m7 17 2-5-5 1 1-5 5-5h5l-1 3c5 3 6 7 4 11M7 17h11l1 4H5zM10 8h.01" />,
  king: <path d="M12 2v6M9 5h6M8 17 5 10l4-2 3 3 3-3 4 2-3 7M7 17h10v4H7z" />,
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v12h14V8M9 12h6" />
    </>
  ),
  letters: <path d="m3 19 6-14 6 14M5 14h8M21 19v-8h-3a3 3 0 0 0 0 6h3" />,
  music: (
    <>
      <path d="M9 18V5l12-2v13M9 9l12-2" />
      <ellipse cx="6" cy="18" rx="3" ry="2" />
      <ellipse cx="18" cy="16" rx="3" ry="2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-3 5-5 3 3-5z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

/** Decorative icons inherit their surrounding text size and color. */
export default function Icon({ name, className = "", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={`icon ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
