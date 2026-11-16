import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Court Vision Admin",
  robots: { index: false, follow: false },
};

export default function CourtVisionAdminLayout({ children }: { children: ReactNode }) {
  return children;
}
