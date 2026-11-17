import Link from "next/link";
import { Suspense } from "react";
import { hasPublicCv } from "@/lib/cv.server";
import {
  publicCollections,
  type CollectionGroup,
} from "@/lib/public-navigation";
import { publicContact } from "@/lib/public-contact";
import CVLinks from "./CVLinks";
import NavigationLinks from "./NavigationLinks";
import WorkspaceIcon from "./WorkspaceIcon";
import WorkspaceToolbar from "./WorkspaceToolbar";

function SourceGroup({ group }: { group: CollectionGroup }) {
  const fallback = publicCollections
    .filter((collection) => collection.group === group)
    .map((collection) => (
      <Link
        key={collection.href}
        href={collection.href}
        className="v3-source-link"
      >
        <WorkspaceIcon name={collection.icon} />
        <span>{collection.label}</span>
      </Link>
    ));
  return (
    <section
      className="v3-source-group"
      aria-label={
        group === "workbench" ? "Workbench collections" : "Off-duty collections"
      }
    >
      <p className="v3-source-heading">
        {group === "workbench" ? "Portfolio" : "After hours"}
      </p>
      <Suspense fallback={fallback}>
        <NavigationLinks group={group} />
      </Suspense>
    </section>
  );
}
export default function SiteNavigation() {
  const available = hasPublicCv();
  const menu = (
    <nav aria-label="Main navigation">
      <SourceGroup group="workbench" />
      <SourceGroup group="off-duty" />
    </nav>
  );
  return (
    <>
      <aside className="v3-sidebar" aria-label="Fieldwork workspace">
        <Link href="/" className="v3-workspace-brand">
          <span className="v3-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 23 16 9l8 14M8 23h16" />
              <circle cx="16" cy="9" r="3" />
              <circle cx="8" cy="23" r="3" />
              <circle cx="24" cy="23" r="3" />
            </svg>
          </span>
          <span>
            Fieldwork<small>Kondwani Phiri</small>
          </span>
        </Link>
        {menu}
        <div className="v3-sidebar-note">
          <span>Lusaka roots.</span>
          <span>Grambling days.</span>
          <a href={publicContact.href}>{publicContact.label} &#8599;</a>
        </div>
      </aside>
      <Suspense
        fallback={
          <header className="v3-toolbar">
            <Link href="/" className="v3-toolbar-home">
              Home
            </Link>
            <span className="v3-toolbar-location" />
            <div className="v3-toolbar-actions">
              <CVLinks available={available} compact />
            </div>
            <nav
              className="v3-mobile-direct-nav"
              aria-label="Section navigation"
            >
              {publicCollections
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
            </nav>
          </header>
        }
      >
        <WorkspaceToolbar resume={<CVLinks available={available} compact />} />
      </Suspense>
    </>
  );
}
