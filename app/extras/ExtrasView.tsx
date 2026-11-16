import SiteNavigation from "../components/SiteNavigation";
import { Suspense } from "react";
import PublishedCollection from "../components/PublishedCollection";



import { channels, findChannel } from "../../lib/extras";
import Feedback from "../components/Feedback";
import Link from "next/link";
import dynamic from "next/dynamic";
import Icon from "../components/Icon";
import SpotifyListeningRoom from "../components/SpotifyListeningRoom";
import PersonalInterests from "../components/PersonalInterests";

const ChessCorner = dynamic(() => import("./ChessCorner"), { loading: () => <Feedback kind="loading">Opening Chess Corner...</Feedback> });
const CourtVision = dynamic(() => import("./CourtVision"), { loading: () => <Feedback kind="loading">Opening Court Vision...</Feedback> });
import "./extras.css";
import "./chess-corner.css";
import "./editorial-extras.css";

export default function ExtrasView({ channelId }: { channelId?: string }) {
  const activeChannel = channelId ? findChannel(channelId) : null;
  return (
    <main id="main-content" tabIndex={-1} className="extras-page">
      <SiteNavigation />
      <header className="extras-topbar">
        <p className="extras-section-marker">Outside the laboratory</p>

        <Link href="/" className="extras-return-link">
          <span aria-hidden="true">←</span>
          Back to portfolio
        </Link>
      </header>

      <div className="extras-main-content">
        {!activeChannel ? (
          <>
            <section className="extras-intro" data-living-destination="extras">
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
                  <h2>Explore the channels</h2>
                </div>

                <span>{String(channels.length).padStart(2, "0")} CHANNELS</span>
              </div>

              <div className="extras-channel-grid">
                {channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/extras/${channel.id}`}
                    className={`extras-channel-card extras-channel-card--${channel.color}`}
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
                      <Icon name={channel.icon} />
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
                  </Link>
                ))}
              </div>
            </section>
            <details className="personal-fieldnotes"><summary>Personal field notes</summary><PersonalInterests /></details>
          </>
        ) : (
          <section className="extras-channel-page">
            <Link
              href="/extras"
              className="extras-back-to-channels"
            >
              <span aria-hidden="true">←</span>
              All channels
            </Link>

            <div
              className={`extras-channel-hero extras-channel-hero--${activeChannel.color}`}
              data-living-destination={activeChannel.id === "chess" || activeChannel.id === "basketball" || activeChannel.id === "listening" ? activeChannel.id : undefined}
            >
              <div className="extras-channel-hero-icon">
                <Icon name={activeChannel.icon} />
              </div>

              <div className="extras-channel-hero-text">
                <p className="extras-eyebrow">
                  CHANNEL {activeChannel.number}
                </p>

                <h1>{activeChannel.title}</h1>

                <p>{activeChannel.description}</p>
              </div>
            </div>

            {activeChannel.id === "listening" ? (
              <SpotifyListeningRoom />
            ) : activeChannel.id === "chess" ? (
              <Suspense fallback={<Feedback kind="loading">Opening Chess Corner...</Feedback>}><ChessCorner /></Suspense>
            ) : activeChannel.id === "basketball" ? (
              <Suspense fallback={<Feedback kind="loading">Opening Court Vision...</Feedback>}><CourtVision /></Suspense>
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

      <Suspense fallback={<Feedback kind="loading">Opening recent additions...</Feedback>}><PublishedCollection kind="extras" /></Suspense>
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
