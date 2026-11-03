
"use client";
import { useEffect, useState } from "react";
import SpotifyListeningRoom from "./components/SpotifyListeningRoom";

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showSite, setShowSite] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      setShowLanding(false);
      setShowSite(true);
    }
  }, []);

  const enterWebsite = () => {
    if (isLeaving) return;

    setIsLeaving(true);

    window.setTimeout(() => {
      setShowLanding(false);
      setShowSite(true);
    }, 700);
  };

  return (
    <>
      {/* POLAROID ENTRANCE SCREEN */}
      {showLanding && (
        <div className={`landing-screen ${isLeaving ? "is-leaving" : ""}`}>
          <div className="landing-label">
            KONDWANI PHIRI — PERSONAL SPACE
          </div>

          <div className="polaroid">
            <div className="polaroid-photo">
              <img
                src="/portrait.jpg"
                alt="Portrait of Kondwani Phiri"
              />
            </div>

            <div className="polaroid-caption">
              A little bit of everything.
            </div>
          </div>

          <div className="landing-bottom">
            <div className="loading-info">
              <span>YOUR EXPERIENCE IS READY</span>
              <span>100%</span>
            </div>

            <div className="loading-track">
              <div className="loading-fill"></div>
            </div>

            <button
              className="enter-button"
              onClick={enterWebsite}
              disabled={isLeaving}
            >
              {isLeaving ? "Welcome..." : "Click to enter ↗"}
            </button>
          </div>

          <div className="landing-copyright">
            © 2026 KONDWANI PHIRI
          </div>
        </div>
      )}

      {/* MAIN WEBSITE */}
      <main className={`site-content ${showSite ? "is-visible" : ""}`}>

        {/* NAVIGATION */}
        <nav className="navigation">
          <a href="/" className="wordmark">
            Kondwani Phiri<span>.</span>
          </a>

          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="/research">Research</a>
            <a href="#gallery">Gallery</a>
            <a href="/extras">Extras</a>
          </div>

          <span className="availability">
            <span className="status-dot"></span>
            Open to opportunities
          </span>
        </nav>

        {/* HOMEPAGE HERO */}
        <section className="hero">
          <div className="hero-meta">
            <span>PERSONAL PORTFOLIO</span>
            <span>EST. 2026 · LUSAKA / GRAMBLING</span>
          </div>

          <div className="hero-content">
            <p className="eyebrow">
              BIOLOGY · TECHNOLOGY · EVERYTHING ELSE
            </p>

            <h1>
              Hello, I&apos;m
              <br />
              <span>Kondwani.</span>
            </h1>

            <p className="hero-description">
              A curious mind somewhere between the laboratory,
              the chessboard, and whatever interesting thing
              I happen to discover next.
            </p>

            <div className="hero-actions">
              <a href="#about" className="primary-link">
                Get to know me ↗
              </a>

              <a href="#experience" className="secondary-link">
                Explore my experience
              </a>
            </div>
          </div>

          <div className="hero-footer">
            <span>SCROLL TO EXPLORE</span>
            <span>01 — 06</span>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <div className="about-heading">
            <p className="section-label">
              01 / THE PERSON BEHIND THE WORK
            </p>

            <span className="section-side-note">
              A little context, a lot of curiosity.
            </span>
          </div>

          <div className="about-layout">
            <div className="about-copy">
              <p className="about-intro">
                I&apos;m a scientist in training, a problem-solver
                by nature, and a curious person by default.
              </p>

              <p>
                I grew up in the Mtendere compound of Lusaka,
                Zambia, in a large family of nine, and I&apos;m
                currently a junior at Grambling State University,
                studying Biology with a minor in Computer Science.
              </p>

              <p>
                In tenth grade, I made a science project after
                just learning about acids and bases. It was a
                fire extinguisher that worked using discarded
                eggshells and ordinary vinegar, and it won me
                first place at a science fair. Since then,
                I&apos;ve been excited about how &quot;small&quot;
                things can make a big impact on people&apos;s
                lives, and that&apos;s one of the reasons I
                chose to study Biology.
              </p>

              <p>
                Today, I&apos;m interested in cancer biology,
                molecular mechanisms of disease, and the
                possibility of turning scientific discoveries
                at the cellular and molecular levels into
                meaningful improvements in people&apos;s lives.
              </p>

              <p>
                But there&apos;s more to me than coursework
                and lab work. I find my curiosity in other
                things as well. You&apos;ll probably find me
                playing basketball, studying a chess position
                (I&apos;m a wannabe GM), listening to music,
                or getting unnecessarily competitive over Scrabble.
              </p>

              <p className="about-closing">
                Hope that tells you a little bit about me!
              </p>

              <div className="about-interests">
                <span>Biology</span>
                <span>Technology</span>
                <span>Chess</span>
                <span>Basketball</span>
                <span>Music</span>
                <span>Scrabble</span>
                <span>Curiosity</span>
              </div>
            </div>

            {/* FIELD NOTES CARD */}
            <aside className="about-card">
              <div className="about-card-heading">
                <span>FIELD NOTES</span>
                <span>NO. 001</span>
              </div>

              <div className="about-fact">
                <span>ORIGIN</span>
                <strong>Lusaka, Zambia</strong>
              </div>

              <div className="about-fact">
                <span>CURRENTLY</span>
                <strong>Grambling, Louisiana</strong>
              </div>

              <div className="about-fact">
                <span>STUDYING</span>
                <strong>Biology + Computer Science</strong>
              </div>

              <div className="about-fact">
                <span>EXPLORING</span>
                <strong>Oncology &amp; translational research</strong>
              </div>

              <div className="about-card-footer">
                <span>ALWAYS LEARNING.</span>
                <span>ALWAYS BUILDING.</span>
              </div>
            </aside>
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="experience-section">
          <div className="section-topline">
            <p className="section-label">
              02 / WHAT I&apos;VE BEEN WORKING ON
            </p>

            <span className="section-side-note">
              Research, work, and a few things in between.
            </span>
          </div>

          <div className="experience-intro">
            <h2>
              Experience shaped
              <br />
              by <em>curiosity.</em>
            </h2>

            <p>
              From studying cellular responses to environmental
              toxicants to exploring the effects of marine
              heatwaves on seabirds, these are some of the
              questions and projects I&apos;ve had the chance
              to work on.
            </p>
          </div>

          {/* RESEARCH EXPERIENCES */}
          <div className="experience-category-heading">
            <span>RESEARCH EXPERIENCE</span>
            <span>01 — 03</span>
          </div>

          <div className="experience-grid">

            {/* DR. DORSEY */}
            <a href="/research#dorsey" className="experience-card">
              <div className="experience-card-top">
                <span className="experience-number">01</span>
                <span className="experience-type">MOLECULAR BIOLOGY</span>
              </div>

              <div className="experience-card-content">
                <p className="experience-mentor">
                  DR. WANEENE DORSEY · LS-LAMP SCHOLAR
                </p>

                <h3>Molecular Toxicology Laboratory</h3>

                <p className="experience-description">
                  Studying how pentachlorophenol exposure affects
                  mouse liver cells, with a focus on inflammation,
                  gene expression, and cell-survival signaling.
                </p>

                <div className="experience-tags">
                  <span>Mouse hepatocytes</span>
                  <span>Cell culture</span>
                  <span>Western blot</span>
                  <span>SDS-PAGE</span>
                  <span>PCR</span>
                </div>
              </div>

              <div className="experience-card-bottom">
                <span>GRAMBLING STATE UNIVERSITY</span>
                <span>AUG 2025 – PRESENT</span>
              </div>
            </a>

            {/* DR. DOUGLAS */}
            <a
              href="/research#douglas"
              className="experience-card clickable-experience"
            >
              <div className="experience-card-top">
                <span className="experience-number">02</span>
                <span className="experience-type">ENVIRONMENTAL BIOLOGY</span>
              </div>

              <div className="experience-card-content">
                <p className="experience-mentor">
                  DR. HECTOR DOUGLAS III
                </p>

                <h3>Environment &amp; Developmental Biology Lab</h3>

                <p className="experience-description">
                  Investigating physiological stress and oxidative
                  balance in tropical seabirds during and after
                  marine heatwave conditions in Culebra, Puerto Rico.
                </p>

                <div className="experience-tags">
                  <span>Corticosterone</span>
                  <span>ELISA</span>
                  <span>TBARS</span>
                  <span>Antioxidant assays</span>
                  <span>Python</span>
                </div>
              </div>

              <div className="experience-card-bottom">
                <span>VIEW RESEARCH DETAILS</span>
                <span>↗</span>
              </div>
            </a>

            {/* DR. YANG */}
            <a
              href="/research#yang"
              className="experience-card clickable-experience"
            >
              <div className="experience-card-top">
                <span className="experience-number">03</span>
                <span className="experience-type">RENEWABLE ENERGY</span>
              </div>

              <div className="experience-card-content">
                <p className="experience-mentor">
                  DR. YANG HAEYEON
                </p>

                <h3>Quantum Dots &amp; Solar Cells</h3>

                <p className="experience-description">
                  Led a team of five evaluating how quantum dots
                  could act as wavelength conversion materials
                  and theoretically improve solar-cell power generation.
                </p>

                <div className="experience-tags">
                  <span>Quantum dots</span>
                  <span>Solar energy</span>
                  <span>Excel</span>
                  <span>Data modeling</span>
                </div>
              </div>

              <div className="experience-card-bottom">
                <span>VIEW RESEARCH DETAILS</span>
                <span>↗</span>
              </div>
            </a>
          </div>

          <div className="research-portfolio-link">
            <div>
              <p>WANT TO TAKE A CLOSER LOOK?</p>
              <h3>Explore my research portfolio.</h3>
            </div>

            <a href="/research" className="primary-link">
              View research ↗
            </a>
          </div>

          {/* PROFESSIONAL EXPERIENCE */}
          <div className="experience-category-heading professional-heading">
            <span>PROFESSIONAL DEVELOPMENT</span>
            <span>04</span>
          </div>

          <article className="professional-card">
            <div className="professional-card-main">
              <p className="experience-mentor">
                HBCU FIRST · SEPTEMBER – DECEMBER 2025
              </p>

              <h3>Day-One-Ready Academy Intern</h3>

              <p>
                Completed industry-led training with Memorial Sloan
                Kettering Cancer Center, Deloitte, U.S. Bank, Indeed,
                and LinkedIn, gaining exposure to professional
                communication, financial literacy, and career
                development practices.
              </p>
            </div>

            <div className="professional-card-side">
              <span>CAREER DEVELOPMENT</span>
              <span>PROFESSIONAL TRAINING</span>
            </div>
          </article>

          {/* LEADERSHIP AND COMMUNITY */}
          <div className="experience-category-heading professional-heading">
            <span>LEADERSHIP &amp; COMMUNITY</span>
            <span>MORE EXPERIENCES</span>
          </div>

          <div className="leadership-list">
            <article className="leadership-item">
              <div>
                <h3>American Cancer Society — GSU Chapter</h3>
                <p>President · Grambling State University</p>
              </div>

              <span>JAN 2025 – PRESENT</span>

              <p className="leadership-description">
                Founded and lead the Colleges Against Cancer chapter
                at Grambling State University, building its executive
                board and organizing cancer education and fundraising
                initiatives.
              </p>
            </article>

            <article className="leadership-item">
              <div>
                <h3>Resident Assistant</h3>
                <p>Grambling State University · Campus Living &amp; Housing</p>
              </div>

              <span>MAY 2025 – PRESENT</span>

              <p className="leadership-description">
                Support residential students with academic,
                transitional, and social concerns while planning
                educational and community-building programs.
              </p>
            </article>

            <article className="leadership-item">
              <div>
                <h3>Education Access Global</h3>
                <p>Mentor &amp; Co-founder · Remote</p>
              </div>

              <span>JUN 2024 – PRESENT</span>

              <p className="leadership-description">
                Mentor Zambian students pursuing higher education
                through essay reviews, SAT preparation resources,
                college application workshops, and scholarship guidance.
              </p>
            </article>
          </div>
        </section>

        {/* GALLERY PLACEHOLDER */}
        <section id="gallery" className="placeholder-section">
          <p>03 / GALLERY</p>
          <h2>Life beyond the laboratory.</h2>
          <p>
            People, places, experiences, research presentations,
            and everything in between.
          </p>
        </section>

        {/* EXTRAS */}
        <section id="extras" className="extras-section">
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
              <span className="extra-icon">♟</span>
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
              <span className="extra-icon">♞</span>
              <p className="extra-label">CHESS CORNER</p>
              <h3>Wannabe GM.</h3>

              <p>
                Studying positions, making questionable moves,
                and occasionally convincing myself that I&apos;m
                one tournament away from becoming a grandmaster.
              </p>

              <a
                href="https://www.chess.com/"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Find me on Chess.com ↗
              </a>
            </article>

            <article className="extra-card">
              <span className="extra-icon">◎</span>
              <p className="extra-label">OTHER INTERESTS</p>
              <h3>A little bit of everything.</h3>

              <p>
                Basketball, Scrabble, Wordle, puzzles, new places,
                good conversations, and whatever else catches
                my attention.
              </p>
            </article>
          </div>

          {/* SPOTIFY LISTENING ROOM */}
          <SpotifyListeningRoom />
        </section>

        {/* FOOTER */}
        <footer className="site-footer">
          <a href="/" className="wordmark">
            Kondwani Phiri<span>.</span>
          </a>

          <p>
            Made with curiosity, a little coffee, and probably
            too many browser tabs.
          </p>

          <span>© 2026 KONDWANI PHIRI</span>
        </footer>
      </main>
    </>
  );
}
