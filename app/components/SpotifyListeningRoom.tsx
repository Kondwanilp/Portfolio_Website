"use client";

import Image from "next/image";
import Feedback from "./Feedback";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import styles from "./SpotifyListeningRoom.module.css";

type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArtwork: string | null;
  spotifyUrl: string | null;
  albumUrl: string | null;
  playCount: number;
};

type SpotifyResponse = {
  totalPlays?: number;
  tracks?: SpotifyTrack[];
  error?: string;
  stale?: boolean;
};

export default function SpotifyListeningRoom({ compact = false }: { compact?: boolean }) {
  const [reload, setReload] = useState(0);
  const [stale, setStale] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [totalPlays, setTotalPlays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      setLoading(true);
      try {
        const response = await fetch("/api/spotify/recently-played", {
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]),
        });

        const data: SpotifyResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load your Spotify listening history."
          );
        }

        const validTracks = Array.isArray(data.tracks)
          ? data.tracks.filter(
              (track) => Boolean(track && track.id && track.name)
            )
          : [];

        if (!controller.signal.aborted) {
          setStale(Boolean(data.stale));
          setTracks(validTracks.slice(0, 5));
          setTotalPlays(data.totalPlays ?? 0);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Spotify Listening Room:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading Spotify."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTracks();

    return () => controller.abort();
  }, [reload]);

  // The API returns tracks ranked from most played to least played.
  // The first track is therefore the Song of the Week.
  const songOfTheWeek = tracks.length > 0 ? tracks[0] : null;

  if (compact) return <section className={styles.compactRoom} aria-labelledby="rotation-title">
    <header className={styles.compactHeader}><h2 id="rotation-title">On repeat</h2><span>This week</span></header>
    {loading && <Feedback kind="loading">Loading Spotify…</Feedback>}
    {!loading && error && <Feedback kind="error" title="Spotify is taking a break." action={<button type="button" onClick={() => setReload(value => value + 1)}>Try again</button>}>{error}</Feedback>}
    {!loading && !error && tracks.length === 0 && <p>No listening history yet.</p>}
    {!loading && !error && tracks.length > 0 && <>
      {stale && <p className={styles.compactNote}>Last available listening history.</p>}
      <ol className={styles.compactTracks}>{tracks.map((track, index) => <li key={track.id}>
        <a href={track.spotifyUrl ?? undefined} target={track.spotifyUrl ? "_blank" : undefined} rel="noopener noreferrer" aria-label={track.spotifyUrl ? `Listen to ${track.name} by ${track.artists.join(", ")} on Spotify` : undefined}>
          <span className={styles.compactArtwork}>{track.albumArtwork ? <Image src={track.albumArtwork} alt="" width={56} height={56} unoptimized /> : <Icon name="music" />}</span>
          <span className={styles.compactTrackInfo}>{index === 0 && <small>Song of the week</small>}<strong>{track.name}</strong><span>{track.artists.join(", ")}</span></span>
          {track.spotifyUrl && <span aria-hidden="true">↗</span>}
        </a>
      </li>)}</ol>
      <p className={styles.compactNote}>From my Spotify listening history.</p>
    </>}
  </section>;

  return (
    <section className={styles.listeningRoom}>
      {/* TOP HEADER */}

      <div className={styles.roomHeader}>
        <div>
          <p className={styles.eyebrow}>THE LISTENING ROOM</p>

          <h2 className={styles.roomTitle}>
            Currently on rotation.
          </h2>

          <p className={styles.roomDescription}>
            A little glimpse into what has been making its way into my
            headphones.
          </p>
        </div>

        <div className={styles.spotifyStatus}>
          <span className={styles.statusDot} />

          <span>
            {loading
              ? "UPDATING"
              : error
                ? "UNAVAILABLE"
                : "CONNECTED"}
          </span>
        </div>
      </div>

      {stale && <Feedback kind="empty">Showing the most recent listening history while Spotify reconnects.</Feedback>}
      {/* WEEKLY LISTENING SUMMARY */}

      <div className={styles.weekSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>THIS WEEK</span>

          <span className={styles.summaryValue}>
            {loading || error ? "—" : totalPlays.toLocaleString()}
          </span>

          <span className={styles.summaryDescription}>
            Total plays
          </span>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>ON ROTATION</span>

          <span className={styles.summaryValue}>
            {loading || error ? "—" : String(tracks.length).padStart(2, "0")}
          </span>

          <span className={styles.summaryDescription}>
            Top tracks
          </span>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>MOST PLAYED</span>

          <span className={styles.summaryValue}>
            {loading || error
              ? "—"
              : songOfTheWeek
                ? songOfTheWeek.playCount.toLocaleString()
                : "—"}
          </span>

          <span className={styles.summaryDescription}>
            Plays this week
          </span>
        </div>
      </div>

      {/* LOADING STATE */}

      {loading && (
        <div className={styles.messageState}>
          <span className={styles.loadingDot} />
          <p>Finding the soundtrack...</p>
        </div>
      )}

      {/* ERROR STATE */}

      {!loading && error && (
        <Feedback kind="error" title="Your listening room is taking a break." action={<button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button>}>{error}</Feedback>
      )}

      {/* EMPTY STATE */}

      {!loading && !error && tracks.length === 0 && (
        <div className={styles.messageState}>
          <h3>No tracks to display just yet.</h3>

          <p>
            Your weekly listening history will appear here once
            Spotify has some plays to share.
          </p>
        </div>
      )}

      {/* MUSIC CONTENT */}

      {!loading && !error && tracks.length > 0 && (
        <div className={styles.musicGrid}>
          {/* TOP FIVE */}

          <div className={styles.songsSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>
                  YOUR WEEKLY CHART
                </p>

                <h3>Songs I&apos;m Listening to</h3>
              </div>

              <span className={styles.trackCount}>
                01 — {String(tracks.length).padStart(2, "0")}
              </span>
            </div>

            <div className={styles.trackList}>
              {tracks.map((track, index) => (
                <a
                  key={track.id}
                  href={
                    track.spotifyUrl ??
                    `https://open.spotify.com/track/${track.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.trackRow}
                >
                  <span className={styles.trackNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {track.albumArtwork ? (
                    <Image unoptimized
                      src={track.albumArtwork}
                      alt={`${track.album} artwork`}
                      className={styles.trackArtwork}
                      width={46}
                      height={46}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.artworkPlaceholder}>
                      <Icon name="music" />
                    </span>
                  )}

                  <span className={styles.trackDetails}>
                    <span className={styles.trackName}>
                      {track.name}
                    </span>

                    <span className={styles.trackArtist}>
                      {track.artists.join(", ")}
                    </span>
                  </span>

                  <span className={styles.playCount}>
                    <strong>{track.playCount}</strong>
                    <span>plays</span>
                  </span>

                  <span className={styles.trackArrow}>
                    ↗
                  </span>
                </a>
              ))}
            </div>

            <p className={styles.listNote}>
              Ranked by number of plays this week.
            </p>
          </div>

          {/* SONG OF THE WEEK */}

          {songOfTheWeek && (
            <div className={styles.weekSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>
                    THE WEEK&apos;S FAVORITE
                  </p>

                  <h3>Song of the Week</h3>
                </div>
              </div>

              <div className={styles.featuredCard}>
                {songOfTheWeek.albumArtwork ? (
                  <Image unoptimized
                    src={songOfTheWeek.albumArtwork}
                    alt={`${songOfTheWeek.album} album artwork`}
                    className={styles.featuredArtwork}
                    width={220}
                    height={220}
                  />
                ) : (
                  <div className={styles.featuredArtworkPlaceholder}>
                    <Icon name="music" />
                  </div>
                )}

                <div className={styles.featuredDetails}>
                  <span className={styles.featuredLabel}>
                    <span className={styles.featuredDot} />
                    MOST PLAYED THIS WEEK
                  </span>

                  <h4 className={styles.featuredName}>
                    {songOfTheWeek.name}
                  </h4>

                  <p className={styles.featuredArtist}>
                    {songOfTheWeek.artists.join(", ")}
                  </p>

                  <p className={styles.featuredAlbum}>
                    {songOfTheWeek.album}
                  </p>

                  <div className={styles.featuredPlayCount}>
                    <span className={styles.featuredPlayNumber}>
                      {songOfTheWeek.playCount}
                    </span>

                    <span>
                      {songOfTheWeek.playCount === 1
                        ? "play this week"
                        : "plays this week"}
                    </span>
                  </div>

                  <a
                    href={
                      songOfTheWeek.spotifyUrl ??
                      `https://open.spotify.com/track/${songOfTheWeek.id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.spotifyLink}
                  >
                    Listen on Spotify <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}

      <div className={styles.roomFooter}>
        <span>UPDATED FROM MY SPOTIFY LISTENING HISTORY</span>

        <span>MADE OF MUSIC &amp; MEMORIES <Icon name="music" /></span>
      </div>
    </section>
  );
}
