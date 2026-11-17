import Image from "next/image";
import Link from "next/link";
import portrait from "../public/Portrait.jpg";
import SiteNavigation from "./components/SiteNavigation";
import SiteFooter from "./components/SiteFooter";
import CVLinks from "./components/CVLinks";
import LegacySectionRedirect from "./components/LegacySectionRedirect";
import WorkspaceIcon from "./components/WorkspaceIcon";
import { hasPublicCv } from "@/lib/cv.server";

const notebooks = [
 { id: "dorsey", number: "01", title: "Molecular Toxicology", subtitle: "Cellular stress & survival", supervisor: "Dr. Waneene Dorsey" },
 { id: "douglas", number: "02", title: "Environmental & Developmental Biology", subtitle: "Stress physiology in tropical seabirds", supervisor: "Dr. Hector Douglas III" },
 { id: "yang", number: "03", title: "Quantum Dots & Solar Cells", subtitle: "Wavelength conversion & materials", supervisor: "Dr. Yang Haeyeon" },
] as const;

export default function Home() {
 return <main id="main-content" tabIndex={-1} className="v3-page v3-workspace">
  <LegacySectionRedirect />
  <SiteNavigation />
  <header className="v3-welcome-heading"><div><p className="v3-overline">A personal scientific workspace</p><h1>Biology, Technology,<br /><em>&amp; Everything Else.</em></h1></div><p>A place for the work.<br />And the person behind it.</p></header>
  <div className="v3-welcome-grid">
   <section className="v3-identity-panel" aria-labelledby="identity-name">
    <figure className="v3-identity-portrait"><Image src={portrait} alt="Kondwani Phiri" sizes="(max-width: 700px) 80vw, 330px" preload /><figcaption>Lusaka &rarr; Grambling</figcaption></figure>
    <div className="v3-identity-copy"><p className="v3-overline">The person behind the work</p><h2 id="identity-name">Kondwani Phiri.</h2><p className="v3-academic-identity">Biology major. Computer Science minor.<br />Undergraduate researcher at Grambling State University.</p><p className="v3-personal-intro">A curious mind somewhere between the laboratory, the chessboard, and whatever interesting thing I happen to discover next.</p><div className="v3-identity-actions"><CVLinks available={hasPublicCv()} /><Link href="/about" className="v3-quiet-link">Read my story <span aria-hidden="true">&#8599;</span></Link></div></div>
   </section>
   <div className="v3-workspace-collections">
    <section className="v3-notebook-collection" aria-labelledby="notebooks-title"><div className="v3-collection-heading"><div><p className="v3-overline">On the workbench</p><h2 id="notebooks-title">Research notebooks</h2></div><Link href="/research" className="v3-quiet-link">Open collection <span aria-hidden="true">&#8599;</span></Link></div><div className="v3-notebook-list">{notebooks.map(notebook => <Link key={notebook.id} href={`/research#${notebook.id}`} className="v3-notebook-row"><span className="v3-file-tab" aria-hidden="true"><WorkspaceIcon name="research" /><span>{notebook.number}</span></span><div><span className="v3-file-subtitle">{notebook.subtitle}</span><h3>{notebook.title}</h3><p>{notebook.supervisor}</p></div><span className="v3-open-file" aria-hidden="true">&#8599;</span></Link>)}</div></section>
    <section className="v3-small-collections" aria-label="Beyond the notebooks"><Link href="/gallery"><WorkspaceIcon name="photos" /><div><h3>From the field</h3><p>Laboratory days, presentations, and the photographs in between.</p></div><span aria-hidden="true">&#8599;</span></Link><Link href="/journal"><WorkspaceIcon name="journal" /><div><h3>Notes worth keeping</h3><p>Research, personal writing, and recent work from the Studio.</p></div><span aria-hidden="true">&#8599;</span></Link></section>
   </div>
  </div>
  <section className="v3-off-duty" aria-labelledby="off-duty-title"><div className="v3-collection-heading"><div><p className="v3-overline">Away from the workbench</p><h2 id="off-duty-title">Still curious.</h2></div><Link href="/extras" className="v3-quiet-link">All interests <span aria-hidden="true">&#8599;</span></Link></div><div className="v3-interest-shelf"><Link href="/extras/listening" className="v3-interest v3-interest--music"><span className="v3-record-art" aria-hidden="true"><i /></span><div><h3>The Listening Room</h3><p>A record on repeat.</p></div><span aria-hidden="true">&#8599;</span></Link><Link href="/extras/chess" className="v3-interest v3-interest--chess"><WorkspaceIcon name="chess" /><div><h3>Chess Corner</h3><p>One position. Another possibility.</p></div><span aria-hidden="true">&#8599;</span></Link><Link href="/extras/basketball" className="v3-interest v3-interest--court"><WorkspaceIcon name="basketball" /><div><h3>Court Vision</h3><p>A game of angles and instincts.</p></div><span aria-hidden="true">&#8599;</span></Link></div></section>
  <SiteFooter />
 </main>;
}
