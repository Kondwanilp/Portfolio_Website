import SiteNavigation from "./components/SiteNavigation";
import LabBenchHome from "./components/LabBenchHome";
import "./lab-bench.css";

export default function Home() {
 return <main id="main-content" tabIndex={-1} className="lab-home"><SiteNavigation /><LabBenchHome /></main>;
}
