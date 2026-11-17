"use client";

import WarriorsNews from "./WarriorsNews";
import Feedback from "../components/Feedback";
import Icon from "../components/Icon";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import "./court-vision.css";

import {
  COURT_VIDEO_BUCKET as BUCKET_NAME,
  formatCourtDate as formatDate,
  type HoopSession,
  type PublishedCourtVideo as CourtVideo,
} from "../../lib/court-vision";

export default function CourtVision() {
  const [sessions, setSessions] = useState<HoopSession[]>([]);
  const [videos, setVideos] = useState<CourtVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadCourtVision() {
      setLoading(true);
      setError("");
      setSessionError("");

      const [sessionResult, videoResult] = await Promise.all([
        supabase
          .from("hoop_sessions")
          .select("id, played_on, location")
          .order("played_on", { ascending: false })
          .abortSignal(controller.signal),

        supabase
          .from("court_videos")
          .select("id, title, description, played_on, location, storage_path")
          .eq("is_published", true)
          .order("played_on", { ascending: false }),
      ]);

      if (!mounted) return;

      if (sessionResult.error) {
        setSessionError("Could not load hoop sessions right now.");
      } else {
        setSessions(sessionResult.data ?? []);
      }

      if (videoResult.error) {
        console.error("Court Vision video error:", videoResult.error);
        setError("Couldn't load the basketball videos right now.");
      } else {
        setVideos(videoResult.data ?? []);
      }

      setLoading(false);
    }

    void loadCourtVision().catch(() => {
      if (!mounted) return;
      setError("Could not load basketball videos right now.");
      setSessionError("Could not load hoop sessions right now.");
      setLoading(false);
    });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [reload]);

  return (
    <div className="court-vision">
      <section className="cv-section cv-warriors-story">
        <p className="cv-story-label">HOW IT ALL STARTED</p>

        <h3>A game that found me.</h3>

        <p>
          Growing up, I wasn&apos;t particularly good at <em>Kampombwa</em>,
          what we call soccer. The boys in my community played every Sunday, and
          I often felt left out. Having slightly curved tibias made controlling
          the ball a little harder for me.
        </p>

        <p>
          Then a friend introduced me to basketball. I was terrible at first,
          but honestly, so were most of us. Somewhere along the way, I fell in
          love with the game.
        </p>

        <p>
          I started watching more of the NBA, and one team caught my attention:
          the 2015 Golden State Warriors. They were fierce, exciting, and
          impossible not to watch. My mom eventually got me a Steph Curry
          jersey, and that made the connection even more special.
        </p>

        <p>
          Basketball gave me something I hadn&apos;t quite found before:
          confidence, belonging, and a new way to enjoy sports. That&apos;s how
          the Warriors became my team.
        </p>
      </section>

      <WarriorsNews />

      {/* PICKUP HIGHLIGHTS */}

      <section className="cv-section cv-video-section">
        <div className="cv-section-heading">
          <div>
            <p className="cv-section-label">01 / THE HIGHLIGHTS</p>
            <h3>From the Court.</h3>
            <p>Little moments, good runs, and memories worth keeping.</p>
          </div>

          <span className="cv-basketball-icon">
            <Icon name="video" />
          </span>
        </div>

        {loading ? (
          <Feedback kind="loading">Loading the highlights...</Feedback>
        ) : error ? (
          <Feedback
            kind="error"
            action={
              <button
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                Try again
              </button>
            }
          >
            {error}
          </Feedback>
        ) : videos.length === 0 ? (
          <div className="cv-empty">
            <span>
              <Icon name="basketball" />
            </span>
            <h4>The highlights are coming.</h4>
            <p>Check back after the next run.</p>
          </div>
        ) : (
          <div className="cv-video-grid">
            {videos.map((video) => {
              const videoUrl = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(video.storage_path).data.publicUrl;

              return (
                <article className="cv-video-card" key={video.id}>
                  <video
                    aria-label={video.title}
                    className="cv-video-player"
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />

                  <div className="cv-video-details">
                    <p className="cv-video-date">
                      {formatDate(video.played_on)} · {video.location}
                    </p>

                    <h4>{video.title}</h4>

                    {video.description && (
                      <p className="cv-video-description">
                        {video.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* RANDOM HOOP SESSIONS */}

      <section className="cv-section cv-sessions">
        <div className="cv-section-heading">
          <div>
            <p className="cv-section-label">02 / THE RUNS</p>
            <h3>Random Hoop Sessions.</h3>
            <p>Just me, a basketball, and whoever shows up.</p>
          </div>

          <span className="cv-basketball-icon">
            <Icon name="basketball" />
          </span>
        </div>

        {loading ? (
          <Feedback kind="loading">Loading hoop sessions...</Feedback>
        ) : sessionError ? (
          <Feedback
            kind="error"
            action={
              <button
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                Try again
              </button>
            }
          >
            {sessionError}
          </Feedback>
        ) : sessions.length === 0 ? (
          <div className="cv-empty">
            <span>
              <Icon name="basketball" />
            </span>
            <h4>No sessions logged yet.</h4>
            <p>The first game is waiting to be documented.</p>
          </div>
        ) : (
          <div className="cv-session-list">
            {sessions.map((session, index) => (
              <article className="cv-session" key={session.id}>
                <span className="cv-session-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="cv-session-details">
                  <h4>{session.location}</h4>
                  <p>{formatDate(session.played_on)}</p>
                </div>

                <span className="cv-basketball">
                  <Icon name="basketball" />
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}

      <div className="cv-footer">
        <span>END OF THE RUN.</span>
        <span>
          SEE YOU ON THE COURT. <Icon name="basketball" />
        </span>
      </div>
    </div>
  );
}
