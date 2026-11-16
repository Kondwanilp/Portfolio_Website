import Link from "next/link";
import CVLinks from "./CVLinks";
import { hasPublicCv } from "@/lib/cv.server";
import { Suspense } from "react";
import NavigationLinks from "./NavigationLinks";
import { publicDestinations } from "@/lib/public-navigation";
export default function SiteNavigation() {
  const fallback = publicDestinations.map(([href, label]) => <Link key={href} href={href}>{label}</Link>);
  const links = <Suspense fallback={fallback}><NavigationLinks /></Suspense>;
  return <nav className="editorial-navigation" aria-label="Main navigation">
    <Link href="/" className="wordmark">Kondwani Phiri<span>.</span></Link>
    <div className="editorial-desktop-links">{links}<CVLinks available={hasPublicCv()} compact /></div>
    <details className="editorial-mobile-menu"><summary>Explore <span aria-hidden="true">＋</span></summary><div>{links}<CVLinks available={hasPublicCv()} compact /></div></details>
  </nav>;
}
