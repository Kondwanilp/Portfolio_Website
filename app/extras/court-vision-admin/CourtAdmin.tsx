"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { loadCourtDashboard } from "../../../lib/court-vision-repository";
import type { CourtVideo, HoopSession } from "../../../lib/court-vision";
import Feedback from "../../components/Feedback";
import AdminLogin from "./AdminLogin";
import SessionEditor from "./SessionEditor";
import VideoLibrary from "./VideoLibrary";
import VideoUploadForm from "./VideoUploadForm";
import { useCourtAuth } from "./useCourtAuth";
import "./court-vision-admin.css";

export function CourtDashboard({ ownerId, today, embedded = false }: { ownerId: string; today: string; embedded?: boolean }) {
  const [data, setData] = useState<{ videos: CourtVideo[]; sessions: HoopSession[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const request = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const load = useCallback(() => {
    request.current?.abort();
    const current = ++revision.current;
    const controller = new AbortController();
    request.current = controller;
    return loadCourtDashboard(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])).then((result) => {
      if (current !== revision.current || controller.signal.aborted) return;
      setData(result); setError("");
    }).catch(() => {
      if (current === revision.current && !controller.signal.aborted) setError("Could not load the dashboard. Please retry.");
    }).finally(() => {
      if (current === revision.current && !controller.signal.aborted) setLoading(false);
    });
  }, []);
  useEffect(() => {
    void load();
    return () => { request.current?.abort(); };
  }, [load]);
  const refresh = useCallback(async () => { setLoading(true); await load(); }, [load]);
  async function logout() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) setError("Could not sign out. Please retry.");
  }
  return (
    <>
      <header className="cv-admin-header">
        <div><p className="cv-admin-eyebrow">YOUR PERSONAL COURTSIDE</p><h1>{embedded ? "Court Vision" : "Dashboard"}<span>.</span></h1><p className="cv-admin-muted">Manage the runs, upload the highlights, and keep the memories.</p></div>
        {!embedded && <button className="cv-admin-logout" type="button" onClick={() => { void logout(); }}>Log out</button>}
      </header>
      {loading && <Feedback kind="loading">Loading your dashboard...</Feedback>}
      {error && <Feedback kind="error" action={<button type="button" onClick={() => { void refresh(); }}>Try again</button>}>{error}</Feedback>}
      <VideoUploadForm ownerId={ownerId} today={today} onSaved={refresh} />
      {data && <><VideoLibrary videos={data.videos} onChanged={refresh} /><SessionEditor sessions={data.sessions} today={today} onSaved={refresh} /></>}
      <footer className="cv-admin-footer">COURT VISION / END OF THE RUN.</footer>
    </>
  );
}

export default function CourtVisionAdmin() {
  const auth = useCourtAuth();
  return (
    <main id="main-content" tabIndex={-1} className="cv-admin-page">
      <div className="cv-admin-topline"><span>COURT VISION / {auth.ownerId ? "ADMIN DASHBOARD" : "PRIVATE AREA"}</span><Link href="/extras/basketball">Back to Court Vision</Link></div>
      {auth.checking ? <Feedback kind="loading">Checking admin access...</Feedback> : auth.ownerId ? <CourtDashboard key={auth.ownerId} ownerId={auth.ownerId} today={auth.today} /> : <AdminLogin sessionError={auth.error} />}
    </main>
  );
}
