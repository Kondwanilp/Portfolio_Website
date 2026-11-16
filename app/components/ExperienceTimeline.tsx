import Link from "next/link";

export default function ExperienceTimeline() {
  return (
        <section id="experience" className="experience-section destination-timeline">
          <div className="section-topline">
            <p className="section-label">
              02 / WHAT I&apos;VE BEEN WORKING ON
            </p>

            <span className="section-side-note">
              Research, work, and a few things in between.
            </span>
          </div>

          <header className="experience-intro" data-living-destination="experience">
            <h1>
              Experience shaped
              <br />
              by <em>curiosity.</em>
            </h1>

            <p>
              From studying cellular responses to environmental
              toxicants to exploring the effects of marine
              heatwaves on seabirds, these are some of the
              questions and projects I&apos;ve had the chance
              to work on.
            </p>
          </header>

          {/* RESEARCH EXPERIENCES */}
          <div className="experience-category-heading">
            <span>RESEARCH EXPERIENCE</span>
            <span>01 — 03</span>
          </div>

          <div className="experience-grid">

            {/* DR. DORSEY */}
            <Link href="/research#dorsey" className="experience-card">
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
            </Link>

            {/* DR. DOUGLAS */}
            <Link
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
            </Link>

            {/* DR. YANG */}
            <Link
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
            </Link>
          </div>

          <div className="research-portfolio-link">
            <div>
              <p>WANT TO TAKE A CLOSER LOOK?</p>
              <h3>Explore my research portfolio.</h3>
            </div>

            <Link href="/research" className="primary-link">
              View research ↗
            </Link>
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

        </section>
  );
}
