import Link from "next/link";

export default function SiteFooter() {
  return <footer className="site-footer"><Link href="/" className="footer-signature">Kondwani Phiri.</Link><p>Made with curiosity, a little coffee, and probably too many browser tabs.</p><Link href="/gallery">Photographs &amp; field notes &#8599;</Link><span>&copy; 2026 KONDWANI PHIRI</span></footer>;
}
