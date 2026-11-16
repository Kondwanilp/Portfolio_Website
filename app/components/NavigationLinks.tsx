"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicDestinations } from "@/lib/public-navigation";

export default function NavigationLinks() {
  const pathname = usePathname();
  return publicDestinations.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href || (href !== "/" && pathname.startsWith(href + "/")) ? "page" : undefined} onClick={event => {
    const menu = event.currentTarget.closest("details");
    if (menu) menu.open = false;
  }}>{label}</Link>);
}
