import SiteNavigation from "./components/SiteNavigation";
import LabHome from "./components/LabHome";
import "./lab-home.css";

export default function Home() {
 return <main id="main-content" tabIndex={-1} className="lab-home"><SiteNavigation /><LabHome /></main>;
}
