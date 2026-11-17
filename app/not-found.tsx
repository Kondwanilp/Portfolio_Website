import Link from "next/link";
import SiteNavigation from "./components/SiteNavigation";
export default function NotFound() {
 return <main id="main-content" className="site-content destination-page"><SiteNavigation /><header className="destination-heading"><p className="section-label">Fieldwork / Unavailable item</p><h1>This file is not here.</h1><p>The address may have changed, or this item has not been published.</p></header><Link className="primary-link" href="/">Return to the workspace</Link></main>;
}
