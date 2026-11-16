import type { Metadata } from "next";
import Link from "next/link";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import PortfolioGallery from "../components/PortfolioGallery";
import PublishedCollection from "../components/PublishedCollection";

export const metadata: Metadata = { title: "Gallery", description: "Original photographs from Kondwani Phiri's laboratory work, research presentations and experiences." };

export default function GalleryPage() {
  return <main id="main-content" tabIndex={-1} className="site-content destination-page gallery-page">
    <SiteNavigation />
    <PortfolioGallery />
    <PublishedCollection kind="gallery" />
    <nav className="chapter-continuation" aria-label="Continue exploring"><Link href="/research">The questions behind the photographs <span aria-hidden="true">&#8599;</span></Link><Link href="/extras">Outside the laboratory <span aria-hidden="true">&#8599;</span></Link></nav>
    <SiteFooter />
  </main>;
}
