import type { Metadata } from "next";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import PublishedCollection from "../components/PublishedCollection";
import ResearchNotebook from "../components/ResearchNotebook";
import { DorseyResearchFile, DouglasResearchFile, YangResearchFile } from "../components/ResearchCaseFiles";
import "./research-notebook.css";

export const metadata: Metadata = {
  title: "Research",
  description: "Kondwani Phiri's research notebook: molecular toxicology, tropical seabird physiology, and quantum dots for solar cells.",
};

export default function ResearchPage() {
  return <main id="main-content" tabIndex={-1} className="research-page fieldwork-research">
    <SiteNavigation />
    <header className="notebook-introduction">
      <div><p className="notebook-label">Undergraduate research</p><h1>Research.</h1></div>
      <p>A closer look at the research projects I&apos;ve contributed to, the questions behind them, the methods I&apos;ve learned, and the people I&apos;ve had the opportunity to work with.</p>
    </header>
    <ResearchNotebook files={[
      { id: "dorsey", content: <DorseyResearchFile /> },
      { id: "douglas", content: <DouglasResearchFile /> },
      { id: "yang", content: <YangResearchFile /> },
    ]} />
    <PublishedCollection kind="research" />
    <SiteFooter />
  </main>;
}
