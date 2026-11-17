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
  <header className="v3-welcome-heading"><div><h1>Biology, Technology,<br /><em>&amp; Everything Else.</em></h1></div></header>
  <div className="v3-welcome-grid">
   <section className="v3-identity-panel" aria-labelledby="identity-name">
    <figure className="v3-identity-portrait"><Image src={portrait} alt="Kondwani Phiri" sizes="(max-width: 700px) 80vw, 330px" preload /><figcaption>Lusaka &rarr; Grambling</figcaption></figure>
    <div className="v3-identity-copy"><h2 id="identity-name">Kondwani Phiri.</h2><p className="v3-academic-identity">Biology major. Computer Science minor.<br />Undergraduate researcher at Grambling State University.</p><p className="v3-personal-intro">Off the clock, I’m into comics, anime, chess, and basketball.</p><div className="v3-identity-actions"><CVLinks available={hasPublicCv()} /><Link href="/about" className="v3-quiet-link">Read my story <span aria-hidden="true">&#8599;</span></Link></div></div>
   </section>
   <div className="v3-workspace-collections">
    <section className="v3-notebook-collection" aria-labelledby="notebooks-title"><div className="v3-collection-heading"><div><h2 id="notebooks-title">Research</h2></div><Link href="/research" className="v3-quiet-link">All projects <span aria-hidden="true">&#8599;</span></Link></div><div className="v3-notebook-list">{notebooks.map(notebook => <Link key={notebook.id} href={`/research#${notebook.id}`} className="v3-notebook-row"><span className="v3-file-tab" aria-hidden="true"><WorkspaceIcon name="research" /><span>{notebook.number}</span></span><div><span className="v3-file-subtitle">{notebook.subtitle}</span><h3>{notebook.title}</h3><p>{notebook.supervisor}</p></div><span className="v3-open-file" aria-hidden="true">&#8599;</span></Link>)}</div></section>
    <section className="v3-small-collections" aria-label="Beyond the notebooks"><Link href="/gallery"><WorkspaceIcon name="photos" /><div><h3>Photographs</h3><p>Lab days and the places in between.</p></div><span aria-hidden="true">&#8599;</span></Link><Link href="/journal"><WorkspaceIcon name="journal" /><div><h3>Journal</h3><p>Things I’m working through.</p></div><span aria-hidden="true">&#8599;</span></Link></section>
   </div>
  </div>
  <Link href="/extras" className="home-afterhours">
    <span className="home-comic-pile" aria-hidden="true"><i><Image src="/comics/aliens-labyrinth.jpg" alt="" width={62} height={85} /></i><i><Image src="/comics/marvel-zombies.jpg" alt="" width={62} height={85} /></i><i><Image src="/comics/thor-god-of-thunder-vol-1.jpg" alt="" width={62} height={85} /></i></span>
    <span><h2>Off the clock.</h2><p>Comics, anime, music, and a game or two.</p></span>
    <span className="home-afterhours-link">Extras <span aria-hidden="true">↗</span></span>
  </Link>
  <SiteFooter />
 </main>;
}
