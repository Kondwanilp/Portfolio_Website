import Image from "next/image";
import Link from "next/link";
import portrait from "../public/Portrait.jpg";
import SiteNavigation from "./components/SiteNavigation";
import SiteFooter from "./components/SiteFooter";
import CVLinks from "./components/CVLinks";
import LegacySectionRedirect from "./components/LegacySectionRedirect";
import { hasPublicCv } from "@/lib/cv.server";

const chapters = [
  { id: "research", href: "/research", number: "01", title: "Research", note: "Questions at the cellular scale, and beyond." },
  { id: "about", href: "/about", number: "02", title: "The person behind the work", note: "Lusaka roots. Grambling days. A curious mind." },
  { id: "experience", href: "/experience", number: "03", title: "Experience", note: "Laboratory work, learning, and new connections." },
  { id: "leadership", href: "/leadership", number: "04", title: "Leadership & community", note: "Education, mentorship, and growing together." },
  { id: "journal", href: "/journal", number: "05", title: "The journal", note: "Research, field notes, and things worth keeping." },
  { id: "extras", href: "/extras", number: "06", title: "Outside the laboratory", note: "A chessboard, a basketball court, a record on repeat." },
] as const;

export default function Home() {
  return <main id="main-content" tabIndex={-1} className="site-content living-home living-os-home">
    <LegacySectionRedirect />
    <SiteNavigation />
    <section className="hero" aria-labelledby="cover-title">
      <div className="hero-content">
        <p className="eyebrow">Biology, Technology, &amp; Everything Else.</p>
        <h1 id="cover-title">Kondwani<br /><span>Phiri.</span></h1>
        <p className="cover-identity">Biology major. Computer Science minor.<br />Undergraduate researcher at Grambling State University.</p>
        <p className="hero-description">A curious mind somewhere between the laboratory, the chessboard, and whatever interesting thing I happen to discover next.</p>
        <div className="cover-cv"><CVLinks available={hasPublicCv()} /></div>
        <div className="hero-actions"><Link href="/research" className="text-link">Explore my research <span aria-hidden="true">&#8599;</span></Link><Link href="/about" className="text-link">Read my story <span aria-hidden="true">&#8599;</span></Link></div>
      </div>
      <figure className="cover-portrait" data-living-portrait>
        <div className="cover-portrait-image"><Image src={portrait} alt="Kondwani Phiri" sizes="(max-width: 700px) 80vw, (max-width: 1100px) 35vw, 350px" preload /></div>
        <figcaption><span>Lusaka roots. Grambling days.</span><span>Always curious.</span></figcaption>
      </figure>
    </section>
    <nav className="exhibition-directory" aria-label="Explore the exhibition">
      {chapters.map(chapter => <Link id={chapter.id} key={chapter.id} href={chapter.href}><span className="directory-number">{chapter.number}</span><div><h2>{chapter.title}</h2><p>{chapter.note}</p></div><span className="directory-arrow" aria-hidden="true">&#8599;</span></Link>)}
    </nav>
    <div id="gallery" className="cover-gallery-link"><Link href="/gallery">Photographs &amp; field notes <span aria-hidden="true">&#8599;</span></Link><span>Lusaka &rarr; Grambling &rarr; wherever curiosity leads.</span></div>
    <SiteFooter />
  </main>;
}
