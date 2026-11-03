
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./SpotifyListeningRoom.module.css";

type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArtwork: string | null;
  spotifyUrl: string | null;
  albumUrl: string | null;
  playedAt?: string;
};

type SpotifyResponse = {
  total?: number;
  tracks?: SpotifyTrack[];
  error?: string;
};

export default function SpotifyListeningRoom() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      try {
        const response = await fetch("/api/spotify/recently-played", {
          cache: "no-store",
          signal: controller.signal,
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
          setTracks(validTracks);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

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
  }, []);

  const uniqueTracks = useMemo(() => {
    const seen = new Set<string>();

    return tracks.filter((track) => {
      if (seen.has(track.id)) return false;

      seen.add(track.id);
      return true;
    });
  }, [tracks]);

  const songOfTheWeek = useMemo(() => {
    if (uniqueTracks.length === 0) return null;

    const weekNumber = Math.floor(
      Date.now() / (7 * 24 * 60 * 60 * 1000)
    );

    return uniqueTracks[weekNumber % uniqueTracks.length];
  }, [uniqueTracks]);

  const activeTrack =
    uniqueTracks.find((track) => track.id === selectedTrackId) ??
    songOfTheWeek;

  const needsConnection =
    error && /not connected|reconnect|unauthorized/i.test(error);

  return (
    <section className={styles.listeningRoom}>
      <div className={styles.musicGrid}>
        {/* SONGS I'M LISTENING TO */}

        <div className={styles.songsSection}>
          <div className={styles.sectionHeader}>
            <h2>Songs I'm Listening to</h2>
          </div>

          {loading && (
            <p className={styles.statusText}>Loading your music...</p>
          )}

          {!loading && error && (
            <div className={styles.statusText}>
              <p>
                {needsConnection
                  ? "Spotify isn't connected right now."
                  : error}
              </p>

              {needsConnection && (
                <a
                  href="/api/spotify/login"
                  className={styles.connectLink}
                >
                  Reconnect Spotify ↗
                </a>
              )}
            </div>
          )}

          {!loading && !error && uniqueTracks.length === 0 && (
            <p className={styles.statusText}>
              No recent tracks to show yet.
            </p>
          )}

          {!loading && !error && uniqueTracks.length > 0 && (
            <div className={styles.trackList}>
              {uniqueTracks.slice(0, 10).map((track) => {
                const isActive = activeTrack?.id === track.id;

                return (
                  <button
                    type="button"
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`${styles.trackRow} ${
                      isActive ? styles.activeTrack : ""
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Select ${track.name} by ${track.artists.join(", ")}`}
                  >
                    {track.albumArtwork ? (
                      <img
                        src={track.albumArtwork}
                        alt=""
                        className={styles.trackArtwork}
                        width={36}
                        height={36}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.artworkPlaceholder}>♪</span>
                    )}

                    <span className={styles.trackDetails}>
                      <span className={styles.trackName}>
                        {track.name}
                      </span>

                      <span className={styles.trackArtist}>
                        {track.artists.join(", ")}
                      </span>
                    </span>

                    <span className={styles.trackAction}>
                      {isActive ? "▶" : "↗"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SONG OF THE WEEK */}

        <div className={styles.weekSection}>
          <div className={styles.sectionHeader}>
            <h2>Song of the week</h2>
          </div>

          {loading && (
            <p className={styles.statusText}>
              Finding this week's song...
            </p>
          )}

          {!loading && songOfTheWeek && (
            <div className={styles.featuredTrack}>
              {songOfTheWeek.albumArtwork ? (
                <img
                  src={songOfTheWeek.albumArtwork}
                  alt={`${songOfTheWeek.album} album artwork`}
                  className={styles.featuredArtwork}
                  width={76}
                  height={76}
                />
              ) : (
                <span className={styles.featuredArtworkPlaceholder}>
                  ♪
                </span>
              )}

              <div className={styles.featuredDetails}>
                <h3 className={styles.featuredName}>
                  {songOfTheWeek.name}
                </h3>

                <p className={styles.featuredArtist}>
                  {songOfTheWeek.artists.join(", ")}
                </p>

                <p className={styles.featuredAlbum}>
                  {songOfTheWeek.album}
                </p>

                {songOfTheWeek.albumUrl && (
                  <a
                    href={songOfTheWeek.albumUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.albumLink}
                  >
                    View album ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPACT SPOTIFY PLAYER */}

      {!loading && activeTrack && (
        <div className={styles.playerSection}>
          <iframe
            key={activeTrack.id}
            title={`Spotify player for ${activeTrack.name}`}
            src={`https://open.spotify.com/embed/track/${activeTrack.id}?utm_source=generator&theme=1`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </section>
  );
}
