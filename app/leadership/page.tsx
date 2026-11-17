import type { Metadata } from "next";
import Link from "next/link";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import LeadershipTimeline from "../components/LeadershipTimeline";

export const metadata: Metadata = { title: "Leadership", description: "Kondwani Phiri's leadership, mentorship and community involvement at Grambling and beyond." };

export default function LeadershipPage() {
  return <main id="main-content" tabIndex={-1} className="site-content destination-page leadership-page">
    <SiteNavigation />
    <header className="destination-heading" data-living-destination="leadership"><p className="section-label">Leadership &amp; community</p><h1>Leadership.</h1><p>Education, mentorship, and making room for other people to thrive.</p></header>
    <LeadershipTimeline />
    <nav className="chapter-continuation" aria-label="Continue exploring"><Link href="/experience">Experience <span aria-hidden="true">&#8599;</span></Link><Link href="/gallery">Photographs <span aria-hidden="true">&#8599;</span></Link></nav>
    <SiteFooter />
  </main>;
}
