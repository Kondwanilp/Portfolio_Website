import { Suspense } from "react";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import SpotifyListeningRoom from "../components/SpotifyListeningRoom";
import PublishedCollection from "../components/PublishedCollection";
import TravelGlobe from "./TravelGlobe";
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
        <a className="anime-launch" href="#anime"><span aria-hidden="true">ア</span><span><strong>Anime</strong><small>My watchlist &amp; your recommendations</small></span><span aria-hidden="true">↗</span></a>
        <TravelGlobe />
      </section>
      <ExtrasActivities />
    </div>
    <Suspense fallback={null}><PublishedCollection kind="extras" /></Suspense>
    <SiteFooter />
  </main>;
}
