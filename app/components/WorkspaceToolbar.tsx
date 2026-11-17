"use client";
import Link from "next/link";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { collectionForPath, publicCollections } from "@/lib/public-navigation";

export default function WorkspaceToolbar({ resume }: { resume: ReactNode }) {
  const pathname = usePathname();
  const collection = collectionForPath(pathname);
  return (
    <header className="v3-toolbar">
      <Link
        href="/"
        className="v3-toolbar-home"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        Home
      </Link>
      <div className="v3-toolbar-location" aria-label="Current section">
        {pathname !== "/" && (
          <>
            <span className="v3-toolbar-separator" aria-hidden="true">
              /
            </span>
            <strong>{collection.label}</strong>
          </>
        )}
      </div>
      <div className="v3-toolbar-actions">{resume}</div>
      <nav className="v3-mobile-direct-nav" aria-label="Section navigation">
        {publicCollections
          .filter((item) => item.href !== "/")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </header>
  );
}
