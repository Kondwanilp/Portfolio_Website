import Link from "next/link";
import PublishedCollection from "../components/PublishedCollection";
import SiteNavigation from "../components/SiteNavigation";
import "./journal.css";
export const metadata = { title: "Journal", description: "Research, photographs, notes, and recent work from Kondwani Phiri." };

export default function Journal() {
  return (
    <main id="main-content" className="journal-index">
      <SiteNavigation />
      <header data-living-destination="journal">

        <h1>Journal.</h1>
        <p>Research, photographs, notes, and recent work.</p>
      </header>
      <PublishedCollection showEmpty />
      <footer className="site-footer">
        <Link href="/">Back to the portfolio ↗</Link>
      </footer>
    </main>
  );
}
