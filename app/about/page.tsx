import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portrait from "../../public/Portrait.jpg";
import SiteNavigation from "../components/SiteNavigation";
import CVLinks from "../components/CVLinks";
import { hasPublicCv } from "@/lib/cv.server";

export const metadata: Metadata = {
  title: "About",
  description: "Kondwani Phiri — a scientist in training, from Lusaka, Zambia to Grambling State University. Biology, technology, and everything else.",
};

export default function AboutPage() {
  return <main id="main-content" tabIndex={-1} className="about-page">
    <SiteNavigation />
    <header className="about-page-heading" data-living-destination="about">
      <p className="section-label">About</p>
      <h1>Hi, I’m Kondwani.</h1>
    </header>
    <div className="about-story-layout">
      <aside className="about-portrait-column">
        <figure className="about-portrait" data-living-portrait>
          <Image src={portrait} alt="Kondwani Phiri" sizes="(max-width: 700px) 88vw, 38vw" preload />
          <figcaption>Lusaka roots. Grambling days.</figcaption>
        </figure>
        <dl className="about-place-notes">
          <div><dt>Origin</dt><dd>Lusaka, Zambia</dd></div>
          <div><dt>Currently</dt><dd>Grambling, Louisiana</dd></div>
          <div><dt>Studying</dt><dd>Biology + Computer Science</dd></div>
        </dl>
        <CVLinks available={hasPublicCv()} />
      </aside>
      <article className="about-narrative">
        <p className="about-intro">I&apos;m a scientist in training, a problem-solver by nature, and a curious person by default.</p>
        <p>I grew up in the Mtendere compound of Lusaka, Zambia, in a large family of nine, and I&apos;m currently a junior at Grambling State University, studying Biology with a minor in Computer Science.</p>
        <p>In tenth grade, I made a science project after just learning about acids and bases. It was a fire extinguisher that worked using discarded eggshells and ordinary vinegar, and it won me first place at a science fair. Since then, I&apos;ve been excited about how &quot;small&quot; things can make a big impact on people&apos;s lives, and that&apos;s one of the reasons I chose to study Biology.</p>
        <p>Today, I&apos;m interested in cancer biology, molecular mechanisms of disease, and the possibility of turning scientific discoveries at the cellular and molecular levels into meaningful improvements in people&apos;s lives.</p>
        <p>But there&apos;s more to me than coursework and lab work. I find my curiosity in other things as well. You&apos;ll probably find me playing basketball, studying a chess position (I&apos;m a wannabe GM), listening to music, or getting unnecessarily competitive over Scrabble.</p>
        <p>Hope that tells you a little bit about me!</p>
        <div className="about-story-links"><Link href="/research" className="primary-link">Explore my research ↗</Link><Link href="/extras" className="text-link">Outside the laboratory ↗</Link></div>
      </article>
    </div>
    <nav className="about-next-chapter" aria-label="Continue exploring">
      <span className="section-label">Elsewhere</span>
      <Link href="/experience">Experience &amp; leadership <span aria-hidden="true">↗</span></Link>
      <Link href="/gallery">Photographs &amp; field notes <span aria-hidden="true">↗</span></Link>
      <Link href="/journal">The journal <span aria-hidden="true">↗</span></Link>
    </nav>
    <footer className="site-footer"><Link href="/" className="footer-signature">Kondwani Phiri.</Link><p>Biology, Technology, &amp; Everything Else.</p><Link href="/">Back to the cover ↗</Link></footer>
  </main>;
}
