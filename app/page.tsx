import SiteNavigation from "./components/SiteNavigation";
import LabBenchHome from "./components/LabBenchHome";

export default function Home() {
 return <main id="main-content" tabIndex={-1} className="lab-home"><SiteNavigation /><LabBenchHome /></main>;
}
