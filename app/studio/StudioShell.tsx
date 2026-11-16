"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";
import { supabase } from "../../lib/supabase/client";
import { contentModules } from "../../lib/studio/content";
import Feedback from "../components/Feedback";
import { studioSessionRequest } from "./session-bridge";
import StudioSession from "./StudioSession";
import { EditingContext } from "./EditingContext";
import ConfirmDialog from "./ConfirmDialog";

const navigation = [
  { href: "/studio", title: "Overview" },
  ...contentModules.map(({ id, title }) => ({ href: `/studio/${id}`, title })),
  { href: "/studio/court-vision", title: "Court Vision" },
  { href: "/studio/media", title: "Media library" },
];

export default function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (unsaved && pathname !== href && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      setPending(href);
    }
  }
  async function signOut() {
    setBusy(true); setError("");
    try {
      window.dispatchEvent(new Event("studio:signout"));
      const response = await studioSessionRequest({ method: "DELETE" });
      if (!response.ok) throw new Error("Could not close The Studio session.");
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.refresh();
    } catch { window.dispatchEvent(new Event("studio:resume")); setError("Could not sign out. Please retry."); }
    finally { setBusy(false); }
  }
  return (
    <EditingContext.Provider value={{ unsaved, setUnsaved }}><div className="studio-shell">
      <aside className="studio-sidebar">
        <Link href="/studio" className="studio-wordmark" onClick={(event) => navigate(event, "/studio")}>The Studio<span>.</span></Link>
        <p className="studio-label">KONDWANI PHIRI</p>
        <nav aria-label="Studio navigation">
          {navigation.map(({ href, title }) => <Link key={href} href={href} onClick={(event) => navigate(event, href)} aria-current={pathname === href ? "page" : undefined}>{title}</Link>)}
        </nav>
        <div className="studio-sidebar-bottom">
          <Link href="/" onClick={(event) => navigate(event, "/")}>View portfolio ↗</Link>
          <button type="button" onClick={() => { if (unsaved) setPending("signout"); else void signOut(); }} disabled={busy}>{busy ? "Signing out..." : "Sign out"}</button>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="studio-main">
        <StudioSession />
        {error && <Feedback kind="error">{error}</Feedback>}
        {children}
      </main>
      <ConfirmDialog open={pending !== null} title="Leave unsaved changes?" description="Your latest changes have not been saved. Leaving this editor will discard them." onClose={() => setPending(null)} onConfirm={() => {
        const target = pending;
        setPending(null); setUnsaved(false);
        if (target === "signout") void signOut();
        else if (target) router.push(target);
      }} />
    </div></EditingContext.Provider>
  );
}
