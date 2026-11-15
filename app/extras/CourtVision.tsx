
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import "./court-vision.css";

const BUCKET_NAME = "hoops_bucket";

type HoopSession = {
  id: string;
  played_on: string;
  location: string;
};

type CourtVideo = {
  id: string;
  title: string;
  description: string | null;
  played_on: string;
  location: string;
  storage_path: string;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CourtVision() {
  const [sessions, setSessions] = useState<HoopSession[]>([]);
  const [videos, setVideos] = useState<CourtVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourtVision() {
      setLoading(true);
      setError("");

      const [sessionResult, videoResult] = await Promise.all([
        supabase
          .from("hoop_sessions")
          .select("id, played_on, location")
          .order("played_on", { ascending: false }),

        supabase
          .from("court_videos")
          .select("id, title, description, played_on, location, storage_path")
          .eq("is_published", true)
          .order("played_on", { ascending: false }),
      ]);

      if (!mounted) return;

      if (sessionResult.error) {
        console.error("Court Vision session error:", sessionResult.error);
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

    loadCourtVision();

    return () => {
      mounted = false;
    };
  }, []);

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

        <span className="cv-heading-basketball">🏀</span>
      </section>

      {/* PICKUP HIGHLIGHTS */}

      <section className="cv-section cv-video-section">
        <div className="cv-section-heading">
          <div>
            <p className="cv-section-label">01 / THE HIGHLIGHTS</p>
            <h3>From the Court.</h3>
            <p>Little moments, good runs, and memories worth keeping.</p>
          </div>

          <span className="cv-basketball-icon">🎥</span>
        </div>

        {loading ? (
          <p className="cv-muted">Loading the highlights...</p>
        ) : error ? (
          <div className="cv-error">{error}</div>
        ) : videos.length === 0 ? (
          <div className="cv-empty">
            <span>🏀</span>
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

          <span className="cv-basketball-icon">🏀</span>
        </div>

        {loading ? (
          <p className="cv-muted">Loading hoop sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="cv-empty">
            <span>🏀</span>
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

                <span className="cv-basketball">🏀</span>
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
            Growing up, I wasn't particularly good at <em>Kampombwa</em>,
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
            Basketball gave me something I hadn't quite found before:
            confidence, belonging, and a new way to enjoy sports.
            That's how the Warriors became my team.
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
        <span>SEE YOU ON THE COURT. 🏀</span>
      </div>

    </div>
  );
}
