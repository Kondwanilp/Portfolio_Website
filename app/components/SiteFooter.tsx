import Link from "next/link";
import { publicContact } from "@/lib/public-contact";
export default function SiteFooter() {
 return <footer className="v3-footer"><p>Made with curiosity, a little coffee, and probably too many browser tabs.</p><div><a href={publicContact.href}>{publicContact.label}</a><Link href="/gallery">Photographs</Link><span>&copy; 2026</span></div></footer>;
}
