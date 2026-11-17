"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicCollections, type CollectionGroup } from "@/lib/public-navigation";
import WorkspaceIcon from "./WorkspaceIcon";
export default function NavigationLinks({ group }: { group: CollectionGroup }) {
 const pathname = usePathname();
 return publicCollections.filter(collection => collection.group === group).map(collection => <Link key={collection.href} href={collection.href} className="v3-source-link" aria-current={pathname === collection.href || (collection.href !== "/" && pathname.startsWith(collection.href + "/")) ? "page" : undefined} onClick={event => { const menu = event.currentTarget.closest("details"); if (menu) menu.open = false; }}><WorkspaceIcon name={collection.icon} /><span>{collection.label}</span></Link>);
}
