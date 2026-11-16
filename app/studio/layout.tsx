import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { requireStudioOwner } from "../../lib/studio/auth.server";
import StudioAccess from "./StudioAccess";
import StudioShell from "./StudioShell";
import Feedback from "../components/Feedback";
import "../extras/court-vision-admin/court-vision-admin.css";
import "./studio.css";

export const metadata: Metadata = { title: "The Studio", robots: { index: false, follow: false } };

async function AuthenticatedStudio({ children }: { children: ReactNode }) {
  try { await requireStudioOwner(); }
  catch { return <StudioAccess />; }
  return <StudioShell>{children}</StudioShell>;
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main id="main-content" className="studio-access"><Feedback kind="loading">Opening The Studio...</Feedback></main>}><AuthenticatedStudio>{children}</AuthenticatedStudio></Suspense>;
}
