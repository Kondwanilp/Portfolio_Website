import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isMotionLabEnabled } from "@/lib/motion-lab";
import MotionLaboratory from "./MotionLaboratory";
import "./motion-lab.css";

export const metadata = { title: "Motion Laboratory", robots: { index: false, follow: false } };

export default function MotionLabPage() {
  if (!isMotionLabEnabled(process.env.NODE_ENV)) notFound();
  return <Suspense fallback={<main id="main-content"><p role="status">Opening the Motion Laboratory...</p></main>}><MotionLaboratory /></Suspense>;
}
