
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChessCorner from "./ChessCorner";
import CourtVision from "./CourtVision";
import "./extras.css";
import "./chess-corner.css";

const channels = [
  {
    number: "01",
    id: "chess",
    title: "Chess Corner",
    icon: "♞",
    subtitle: "Think three moves ahead.",
    description:
      "A little space for puzzles, opening experiments, endgames, and games worth studying twice.",
    color: "chess",
    entries: [],
  },
  {
    number: "02",
    id: "basketball",
    title: "Court Vision",
    icon: "🏀",
    subtitle: "A game of angles and instincts.",
    description:
      "Basketball conversations, memorable plays, and everything that makes the game worth watching.",
    color: "basketball",
    entries: [
      {
        title: "The Hardwood",
        description: "Basketball thoughts, observations, and conversations.",
      },
      {
        title: "Highlight Reel",
        description: "Special plays, performances, and unforgettable moments.",
      },
      {
        title: "Game Notes",
        description: "Things noticed while watching the game.",
      },
    ],
  },
  {
    number: "03",
    id: "wordplay",
    title: "Wordplay",
    icon: "Aa",
    subtitle: "There is always another word.",
    description:
      "For the days when a five-letter word, a Scrabble rack, or a clever connection takes over your brain.",
    color: "wordplay",
    entries: [
      {
        title: "Wordle",
        description: "Daily guesses, patterns, and the occasional lucky start.",
      },
      {
        title: "Scrabble Table",
        description: "Vocabulary, letter combinations, and clever plays.",
      },
      {
        title: "Pyralinks",
        description: "Connections, word associations, and lateral thinking.",
      },
    ],
  },
  {
    number: "04",
    id: "archives",
    title: "The Archives",
    icon: "✳",
    subtitle: "A little bit of everything.",
    description:
      "A collection of interests, discoveries, recommendations, and random things worth keeping.",
    color: "archives",
    entries: [
      {
        title: "Currently Into",
        description: "Things catching my attention lately.",
      },
      {
        title: "The Listening Shelf",
        description: "Music, artists, and sounds worth sharing.",
      },
      {
        title: "Rabbit Holes",
        description: "Interesting discoveries that started with one question.",
      },
    ],
  },
] as const;

type Channel = (typeof channels)[number];

export default function ExtrasPage() {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  // Always start at the top when entering or leaving a channel.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [activeChannel]);

  return (
    <main className="extras-page">
      <header className="extras-topbar">
        <Link href="/" className="extras-brand">
          <span className="extras-brand-mark">K</span>

          <span className="extras-brand-text">
            <strong>Kondwani&apos;s Universe</strong>
            <small>A COLLECTION OF SIDE QUESTS</small>
          </span>
        </Link>

        <Link href="/" className="extras-return-link">
          <span aria-hidden="true">←</span>
          Back to portfolio
        </Link>
      </header>

      <div className="extras-main-content">
        {!activeChannel ? (
          <>
            <section className="extras-intro">
              <p className="extras-eyebrow">
                <span className="extras-status-dot" />
                THE UNIVERSE IS OPEN
              </p>

              <h1>
                Welcome to
                <br />
                <span>my little corner.</span>
              </h1>

              <p className="extras-intro-text">
                Outside the lab, there are a few other things keeping
                me busy. Pick a channel and have a look around.
              </p>
            </section>

            <section className="extras-channel-section">
              <div className="extras-channel-section-header">
                <div>
                  <p className="extras-section-eyebrow">
                    THE CHANNEL DIRECTORY
                  </p>
                  <h2>Explore the channels</h2>
                </div>

                <span>04 CHANNELS</span>
              </div>

              <div className="extras-channel-grid">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    className={`extras-channel-card extras-channel-card--${channel.color}`}
                    onClick={() => setActiveChannel(channel)}
                  >
                    <div className="extras-card-top">
                      <span className="extras-channel-number">
                        CHANNEL {channel.number}
                      </span>

                      <span className="extras-card-arrow">↗</span>
                    </div>

                    <div
                      className={`extras-channel-icon extras-channel-icon--${channel.color}`}
                    >
                      {channel.icon}
                    </div>

                    <div className="extras-card-bottom">
                      <div>
                        <h3>{channel.title}</h3>
                        <p>{channel.subtitle}</p>
                      </div>

                      <span className="extras-enter-label">
                        ENTER CHANNEL
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="extras-channel-page">
            <button
              type="button"
              className="extras-back-to-channels"
              onClick={() => setActiveChannel(null)}
            >
              <span aria-hidden="true">←</span>
              All channels
            </button>

            <div
              className={`extras-channel-hero extras-channel-hero--${activeChannel.color}`}
            >
              <div className="extras-channel-hero-icon">
                {activeChannel.icon}
              </div>

              <div className="extras-channel-hero-text">
                <p className="extras-eyebrow">
                  CHANNEL {activeChannel.number}
                </p>

                <h1>{activeChannel.title}</h1>

                <p>{activeChannel.description}</p>
              </div>
            </div>

            {activeChannel.id === "chess" ? (
              <ChessCorner />
            ) : activeChannel.id === "basketball" ? (
              <CourtVision />
            ) : (
              <>
                <div className="extras-channel-content-header">
                  <h2>Inside this channel</h2>
                  <span>A FEW THINGS TO EXPLORE</span>
                </div>

                <div className="extras-entry-grid">
                  {activeChannel.entries.map((entry, index) => (
                    <article className="extras-entry-card" key={entry.title}>
                      <span className="extras-entry-number">
                        0{index + 1}
                      </span>

                      <h3>{entry.title}</h3>
                      <p>{entry.description}</p>
                    </article>
                  ))}
                </div>

                <p className="extras-channel-note">
                  More things will find their way into this channel.
                </p>
              </>
            )}
          </section>
        )}
      </div>

      <footer className="extras-footer">
        <span>KONDWANI&apos;S UNIVERSE</span>

        <span>
          MADE OF CURIOSITY &amp; A LITTLE BIT OF EVERYTHING.
        </span>

        <Link href="/">EXIT TO PORTFOLIO ↗</Link>
      </footer>
    </main>
  );
}
