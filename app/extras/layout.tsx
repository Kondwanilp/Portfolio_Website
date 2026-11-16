import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Extras", template: "%s | Kondwani Phiri" },
  description: "Explore Kondwani's Chess Corner, Court Vision, word games, and discoveries beyond the laboratory.",
};

export default function ExtrasLayout({ children }: { children: ReactNode }) {
  return children;
}
