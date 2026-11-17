import { publicContact } from "@/lib/public-contact";
export default function SiteFooter() {
 return <footer className="v3-footer"><p>Kondwani Phiri · Grambling, Louisiana</p><div><a href={publicContact.href}>{publicContact.label}</a><span>&copy; 2026</span></div></footer>;
}
