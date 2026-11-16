import Link from "next/link";
import Icon from "./Icon";

export default function PersonalInterests() {
  return (
        <section id="personal-interests" className="extras-section">
          <div className="section-topline">
            <p className="section-label">
              04 / OUTSIDE THE LAB
            </p>

            <span className="section-side-note">
              The other things that make me, me.
            </span>
          </div>

          <div className="extras-intro">
            <h2>
              Welcome to my
              <br />
              <em>universe.</em>
            </h2>

            <p>
              Some of the communities I&apos;m part of, things I enjoy,
              and little interests that keep me busy outside school
              and research.
            </p>
          </div>

          <div className="extras-grid">
            <article className="extra-card">
              <span className="extra-icon"><Icon name="pawn" /></span>
              <p className="extra-label">CLUBS &amp; COMMUNITIES</p>
              <h3>Finding my people.</h3>

              <ul>
                <li>GSU PreHealth Society</li>
                <li>GSU Biology Club</li>
                <li>GSU Chess Club</li>
                <li>New Seasons Youth Program</li>
                <li>EducationUSA Zambia</li>
              </ul>
            </article>

            <article className="extra-card">
              <span className="extra-icon"><Icon name="knight" /></span>
              <p className="extra-label">CHESS CORNER</p>
              <h3>Wannabe GM.</h3>

              <p>
                Studying positions, making questionable moves,
                and occasionally convincing myself that I&apos;m
                one tournament away from becoming a grandmaster.
              </p>

              <Link
                href="https://www.chess.com/"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Find me on Chess.com ↗
              </Link>
            </article>

            <article className="extra-card">
              <span className="extra-icon"><Icon name="compass" /></span>
              <p className="extra-label">OTHER INTERESTS</p>
              <h3>A little bit of everything.</h3>

              <p>
                Basketball, Scrabble, Wordle, puzzles, new places,
                good conversations, and whatever else catches
                my attention.
              </p>
            </article>
          </div>

        </section>
  );
}
