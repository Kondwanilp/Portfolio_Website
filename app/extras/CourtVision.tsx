
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import "./court-vision.css";

// Only this Supabase account can add sessions.
const ADMIN_ID = "a78f637f-4bf2-4927-886e-2421af084f4a";

type HoopSession = {
  id: string;
  played_on: string;
  location: string;
};

export default function CourtVision() {
  const [sessions, setSessions] = useState<HoopSession[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [playedOn, setPlayedOn] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [location, setLocation] = useState("");

  const isAdmin = userId === ADMIN_ID;

  // ============================================
  // LOAD HOOP SESSIONS
  // ============================================

  async function loadSessions() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("hoop_sessions")
      .select("id, played_on, location")
      .order("played_on", { ascending: false });

    if (error) {
      console.error("SUPABASE SESSION ERROR:", error);
      setError(`Supabase error: ${error.message}`);
    } else {
      setSessions(data ?? []);
    }

    setLoading(false);
  }

  // ============================================
  // CHECK LOGIN STATUS
  // ============================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUserId(session?.user.id ?? null);
      }

      await loadSessions();
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserId(session?.user.id ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ============================================
  // ADMIN LOGIN
  // ============================================

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
      return;
    }

    if (data.user.id !== ADMIN_ID) {
      await supabase.auth.signOut();
      setLoginError("This account is not authorized to manage sessions.");
      return;
    }

    setUserId(data.user.id);
    setEmail("");
    setPassword("");
  }

  // ============================================
  // ADMIN LOGOUT
  // ============================================

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoginError(error.message);
      return;
    }

    setUserId(null);
    setLoginError("");
  }

  // ============================================
  // ADD A HOOP SESSION
  // ============================================

  async function handleAddSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) {
      setError("You are not authorized to add sessions.");
      return;
    }

    if (!playedOn || !location.trim()) {
      setError("Please enter both a date and a location.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.from("hoop_sessions").insert({
      played_on: playedOn,
      location: location.trim(),
    });

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      setError(`Couldn't save session: ${error.message}`);
    } else {
      setLocation("");
      await loadSessions();
    }

    setSaving(false);
  }

  // ============================================
  // DATE FORMATTING
  // ============================================

  function formatDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="court-vision">

      {/* INTRODUCTION */}

      <section className="cv-intro">
        <div className="cv-section-label">
          A LITTLE FRIENDLY COMPETITION
        </div>

        <h2 className="cv-title">
          Court <span>Vision.</span>
        </h2>

        <p className="cv-description">
          Somewhere between the hardwood, the occasional airball,
          and the love of the game.
        </p>
      </section>

      {/* RANDOM HOOP SESSIONS */}

      <section className="cv-section">
        <div className="cv-section-heading">
          <div>
            <div className="cv-section-label">01 / THE RUNS</div>
            <h3>Random Hoop Sessions</h3>
            <p>
              Just me, a basketball, and whoever shows up.
            </p>
          </div>

          <span className="cv-basketball-icon">🏀</span>
        </div>

        {/* ADMIN CONTROLS */}

        {isAdmin ? (
          <div className="cv-admin-panel">
            <div className="cv-admin-heading">
              <span>SESSION MANAGER</span>
              <button
                type="button"
                className="cv-logout-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>

            <form className="cv-session-form" onSubmit={handleAddSession}>
              <label>
                Date
                <input
                  type="date"
                  value={playedOn}
                  onChange={(event) => setPlayedOn(event.target.value)}
                  required
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. GSU Recreation Center"
                  required
                />
              </label>

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "＋ Add Session"}
              </button>
            </form>
          </div>
        ) : (
          <details className="cv-login">
            <summary>Admin access</summary>

            <form className="cv-login-form" onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Admin email"
                autoComplete="username"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />

              <button type="submit">Log in</button>

              {loginError && (
                <p className="cv-error">{loginError}</p>
              )}
            </form>
          </details>
        )}

        {/* SESSION LIST */}

        {error ? (
          <div className="cv-error">
            {error}
          </div>
        ) : loading ? (
          <p className="cv-muted">Loading hoop sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="cv-empty-state">
            <span>🏀</span>
            <h4>No sessions logged yet.</h4>
            <p>The first game is waiting to be documented.</p>
          </div>
        ) : (
          <div className="cv-session-list">
            {sessions.map((session) => (
              <div className="cv-session-row" key={session.id}>
                <span className="cv-session-date">
                  {formatDate(session.played_on)}
                </span>

                <span className="cv-session-location">
                  {session.location}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GOLDEN STATE WARRIORS */}

      <section className="cv-section">
        <div className="cv-section-label">02 / THE TEAM</div>

        <div className="cv-warriors-card">
          <div className="cv-warriors-content">
            <span className="cv-warriors-overline">
              MY NBA ALLEGIANCE
            </span>

            <h3>Golden State Warriors.</h3>

            <p>
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
      </section>

      {/* CURRENT THOUGHTS */}

      <section className="cv-section">
        <div className="cv-section-label">03 / THE NOTEBOOK</div>

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
