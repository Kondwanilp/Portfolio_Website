import type { Metadata } from "next";
import Link from "next/link";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import ExperienceTimeline from "../components/ExperienceTimeline";
import PublishedCollection from "../components/PublishedCollection";

export const metadata: Metadata = { title: "Experience", description: "Kondwani Phiri's research experience, laboratory training and professional development." };

export default function ExperiencePage() {
  return <main id="main-content" tabIndex={-1} className="site-content destination-page experience-page">
    <SiteNavigation />
    <ExperienceTimeline />
    <PublishedCollection kind="experience" />
    <nav className="chapter-continuation" aria-label="Continue exploring"><Link href="/research">Research in detail <span aria-hidden="true">&#8599;</span></Link><Link href="/leadership">Leadership &amp; community <span aria-hidden="true">&#8599;</span></Link></nav>
    <SiteFooter />
  </main>;
}
