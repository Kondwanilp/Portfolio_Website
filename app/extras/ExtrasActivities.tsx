"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import FloatingWindow from "../components/FloatingWindow";
import Feedback from "../components/Feedback";
import { extrasActivityFromHash, type ExtrasActivity } from "@/lib/comic-omics";

const AnimeLibrary = dynamic(() => import("./AnimeLibrary"));
const activityTitles = { anime: "Anime", chess: "Chess Corner", basketball: "Court Vision" };

const ChessCorner = dynamic(() => import("./ChessCorner"), { loading: () => <Feedback kind="loading">Opening the board…</Feedback> });
const CourtVision = dynamic(() => import("./CourtVision"), { loading: () => <Feedback kind="loading">Loading Court Vision…</Feedback> });

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => { window.removeEventListener("hashchange", callback); window.removeEventListener("popstate", callback); };
}

export default function ExtrasActivities() {
  const activity = useSyncExternalStore(subscribe, () => extrasActivityFromHash(window.location.hash), () => null);

  function close(activityToClose: ExtrasActivity) {
    if (extrasActivityFromHash(window.location.hash) !== activityToClose) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + "#play");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  return <>
    <section className="mood-play" id="play" aria-labelledby="play-title">
      <h2 id="play-title">Got a minute?</h2>
      <div className="mood-play-grid">
        <a href="#chess" className="mood-game mood-game--chess"><span className="mood-chess-art" aria-hidden="true"><span>♞</span></span><span><strong>Chess Corner</strong><small>Wannabe GM. Very real blunders.</small></span><span aria-hidden="true">↗</span></a>
        <a href="#basketball" className="mood-game mood-game--court"><span className="mood-court-art" aria-hidden="true"><i /></span><span><strong>Court Vision</strong><small>Pickup runs &amp; the Warriors.</small></span><span aria-hidden="true">↗</span></a>
      </div>
      <noscript><p><Link href="/extras/chess">Open Chess Corner</Link> · <Link href="/extras/basketball">Open Court Vision</Link>. Games and videos require JavaScript.</p></noscript>
    </section>
    {activity && <FloatingWindow key={activity} title={activityTitles[activity]} subtitle="Extras / Kondwani Phiri" onClose={() => close(activity)} className="extras-activity-window">
      {activity === "anime" ? <AnimeLibrary /> : activity === "chess" ? <ChessCorner /> : <CourtVision />}
    </FloatingWindow>}
  </>;
}
