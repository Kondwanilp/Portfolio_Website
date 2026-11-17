import Link from "next/link";
import { Suspense } from "react";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import SpotifyListeningRoom from "../components/SpotifyListeningRoom";
import PublishedCollection from "../components/PublishedCollection";
import PersonalInterests from "../components/PersonalInterests";
import ComicOmics from "./ComicOmics";
import ExtrasActivities from "./ExtrasActivities";
import "./chess-corner.css";
import "./court-vision.css";
import "./moodboard.css";

export default function ExtrasView() {
  return <main id="main-content" tabIndex={-1} className="extras-page moodboard-page">
    <SiteNavigation />
    <header className="moodboard-intro"><h1>Extras.</h1><p>Comics, music, and everything I get distracted by.</p></header>
    <div className="moodboard-grid">
      <ComicOmics />
      <section className="mood-card mood-music" id="listening"><SpotifyListeningRoom compact /></section>
      <section id="interests" className="mood-card mood-interests" aria-labelledby="interests-title">
        <header className="mood-card-heading"><h2 id="interests-title">My kind of thing</h2></header>
        <ul className="mood-interests-list">
          <li><span className="interest-mark interest-mark--comics" aria-hidden="true">M / DC</span><span><strong>Comics</strong><small>Marvel, DC, and a growing reading pile.</small></span><a href="#comics" aria-label="Browse Comic-Omics">↗</a></li>
          <li><span className="interest-mark interest-mark--anime" aria-hidden="true">ア</span><span><strong>Anime</strong><small>Always room for another episode.</small></span></li>
          <li><span className="interest-mark interest-mark--adventure" aria-hidden="true">↗</span><span><strong>New places</strong><small>There’s always somewhere else to go.</small></span><Link href="/gallery" aria-label="See my photographs">↗</Link></li>
          <li><span className="interest-mark interest-mark--science" aria-hidden="true">ATG</span><span><strong>Biology &amp; building things</strong><small>The curiosity follows me home.</small></span><Link href="/research" aria-label="Read about my research">↗</Link></li>
        </ul>
        <details className="mood-more"><summary>A little more about me</summary><PersonalInterests /></details>
      </section>
      <ExtrasActivities />
    </div>
    <Suspense fallback={null}><PublishedCollection kind="extras" /></Suspense>
    <SiteFooter />
  </main>;
}
