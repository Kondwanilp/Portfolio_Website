
"use client";

import Feedback from "../components/Feedback";
import Icon from "../components/Icon";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import "./court-vision.css";

import { COURT_VIDEO_BUCKET as BUCKET_NAME, formatCourtDate as formatDate, type HoopSession, type PublishedCourtVideo as CourtVideo } from "../../lib/court-vision";

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
          .order("played_on", { ascending: false }).abortSignal(controller.signal),

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

      {/* INTRODUCTION */}

      <section className="cv-heading">
        <div>
          <p className="cv-eyebrow">A LITTLE FRIENDLY COMPETITION</p>

          <h2>
            Court <span>Vision.</span>
          </h2>

          <p className="cv-intro">
            Somewhere between the hardwood, the occasional airball,
            and the love of the game.
          </p>
        </div>

        <svg className="cv-court-study" viewBox="0 0 260 190" aria-hidden="true"><path d="M20 170V20H240V170ZM90 20V90H170V20M90 90A40 40 0 0 0 170 90M35 20V55A95 95 0 0 0 225 55V20M110 30H150M130 30V43" /><circle cx="130" cy="49" r="6" /><path d="M20 170A43 43 0 0 1 106 170M106 170H240" /></svg>
      </section>

      {/* PICKUP HIGHLIGHTS */}

      <section className="cv-section cv-video-section">
        <div className="cv-section-heading">
          <div>
            <p className="cv-section-label">01 / THE HIGHLIGHTS</p>
            <h3>From the Court.</h3>
            <p>Little moments, good runs, and memories worth keeping.</p>
          </div>

          <span className="cv-basketball-icon"><Icon name="video" /></span>
        </div>

        {loading ? (
          <Feedback kind="loading">Loading the highlights...</Feedback>
        ) : error ? (
          <Feedback kind="error" action={<button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button>}>{error}</Feedback>
        ) : videos.length === 0 ? (
          <div className="cv-empty">
            <span><Icon name="basketball" /></span>
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

          <span className="cv-basketball-icon"><Icon name="basketball" /></span>
        </div>

        {loading ? (
          <Feedback kind="loading">Loading hoop sessions...</Feedback>
        ) : sessionError ? (
          <Feedback kind="error" action={<button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button>}>{sessionError}</Feedback>
        ) : sessions.length === 0 ? (
          <div className="cv-empty">
            <span><Icon name="basketball" /></span>
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

                <span className="cv-basketball"><Icon name="basketball" /></span>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* GOLDEN STATE WARRIORS */}

      <section className="cv-section cv-warriors-section">
        <p className="cv-section-label">03 / THE TEAM</p>

        <div className="cv-warriors-card">
          <div className="cv-warriors-content">
            <span className="cv-warriors-overline">
              MY NBA ALLEGIANCE
            </span>

            <h3>Golden State Warriors.</h3>

            <p className="cv-warriors-tagline">
              Strength in Numbers. Dub Nation.
            </p>

            <a
              href="https://www.nba.com/warriors"
              target="_blank"
              rel="noreferrer"
              className="cv-warriors-link"
            >
              Visit the Warriors <span>↗</span>
            </a>
          </div>

          <div className="cv-warriors-mark">
            <span>GSW</span>
            <small>DUB NATION</small>
          </div>
        </div>

        <div className="cv-warriors-story">
          <p className="cv-story-label">HOW IT ALL STARTED</p>

          <h3>A game that found me.</h3>

          <p>
            Growing up, I wasn&apos;t particularly good at <em>Kampombwa</em>,
            what we call soccer. The boys in my community played every
            Sunday, and I often felt left out. Having slightly curved
            tibias made controlling the ball a little harder for me.
          </p>

          <p>
            Then a friend introduced me to basketball. I was terrible
            at first, but honestly, so were most of us. Somewhere
            along the way, I fell in love with the game.
          </p>

          <p>
            I started watching more of the NBA, and one team caught
            my attention: the 2015 Golden State Warriors. They were
            fierce, exciting, and impossible not to watch. My mom
            eventually got me a Steph Curry jersey, and that made
            the connection even more special.
          </p>

          <p>
            Basketball gave me something I hadn&apos;t quite found before:
            confidence, belonging, and a new way to enjoy sports.
            That&apos;s how the Warriors became my team.
          </p>
        </div>
      </section>

      {/* CURRENT THOUGHTS */}

      <section className="cv-section cv-thoughts-section">
        <p className="cv-section-label">04 / THE NOTEBOOK</p>

        <div className="cv-section-heading">
          <div>
            <h3>Current Thoughts.</h3>
            <p>Random observations from a basketball enthusiast.</p>
          </div>
        </div>

        <div className="cv-thoughts-grid">
          <article className="cv-thought-note">
            <span>01</span>
            <p>
              Basketball is a game of runs. Stay composed when
              the other team goes on one.
            </p>
            <small>THE MENTAL GAME</small>
          </article>

          <article className="cv-thought-note">
            <span>02</span>
            <p>
              Sometimes the best play is making the extra pass.
            </p>
            <small>TEAM FIRST</small>
          </article>

          <article className="cv-thought-note">
            <span>03</span>
            <p>
              You can always get another shot. You cannot get
              back the possession you wasted.
            </p>
            <small>ON THE COURT</small>
          </article>
        </div>
      </section>

      {/* FOOTER */}

      <div className="cv-footer">
        <span>END OF THE RUN.</span>
        <span>SEE YOU ON THE COURT. <Icon name="basketball" /></span>
      </div>

    </div>
  );
}
