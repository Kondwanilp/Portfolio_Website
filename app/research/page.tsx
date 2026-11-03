
export default function ResearchPage() {
  return (
    <main className="research-page">

      {/* RESEARCH PAGE NAVIGATION */}
      <nav className="navigation">
        <a href="/" className="wordmark">
          Kondwani Phiri<span>.</span>
        </a>

        <div className="nav-links">
          <a href="/#about">About</a>
          <a href="/#experience">Experience</a>
          <a href="/research">Research</a>
          <a href="/#gallery">Gallery</a>
          <a href="/#extras">Extras</a>
        </div>

        <a href="/" className="back-home">
          ← Back home
        </a>
      </nav>

      {/* RESEARCH HERO */}
      <header className="research-hero">
        <p className="section-label">
          SELECTED RESEARCH · 2024–PRESENT
        </p>

        <h1>
          Questions worth
          <br />
          <em>investigating.</em>
        </h1>

        <p>
          A closer look at the research projects I&apos;ve contributed
          to, the questions behind them, the methods I&apos;ve learned,
          and the people I&apos;ve had the opportunity to work with.
        </p>

        <div className="research-hero-footer">
          <span>GRAMBLING STATE UNIVERSITY</span>
          <span>BIOLOGY · ENVIRONMENT · MATERIALS SCIENCE</span>
        </div>
      </header>

      {/* RESEARCH NAVIGATION */}
      <div className="research-index">
        <a href="#dorsey">01 · Molecular Toxicology</a>
        <a href="#douglas">02 · Environmental Biology</a>
        <a href="#yang">03 · Quantum Dots</a>
      </div>

      {/* PROJECT 01: DR. DORSEY */}
      <section id="dorsey" className="research-project">
        <div className="research-project-heading">
          <div>
            <p className="section-label">RESEARCH PROJECT 01</p>
            <h2>Molecular Toxicology</h2>
            <p className="research-supervisor">
              Dr. Waneene Dorsey · Grambling State University
            </p>
          </div>

          <span className="research-year">2025 – PRESENT</span>
        </div>

        <div className="research-project-body">
          <div className="research-main-copy">
            <p className="research-kicker">
              LS-LAMP RESEARCH SCHOLAR
            </p>

            <h3>
              Investigating how environmental toxicants affect
              liver-cell stress and survival.
            </h3>

            <p>
              My work in the Molecular Toxicology Laboratory involves
              studying how pentachlorophenol exposure affects mouse
              liver cells. The project focuses on cellular stress,
              inflammation, and signaling mechanisms involved in
              cell survival.
            </p>

            <p>
              I work with TIB-73 mouse liver cell cultures, maintaining
              and harvesting cells under sterile conditions. I have
              also performed molecular biology procedures, including
              SDS-PAGE and Western blotting, to examine inflammation-
              related proteins.
            </p>

            <p>
              Through this experience and my LS-LAMP research training,
              I have developed practical experience in mammalian cell
              culture, aseptic technique, cryopreservation, PCR,
              protein analysis, and laboratory documentation.
            </p>
          </div>

          <aside className="research-facts">
            <div>
              <span>LABORATORY</span>
              <strong>Molecular Toxicology Research Laboratory</strong>
            </div>

            <div>
              <span>RESEARCH MODEL</span>
              <strong>TIB-73 Mouse Hepatocytes</strong>
            </div>

            <div>
              <span>EXPOSURE</span>
              <strong>Pentachlorophenol</strong>
            </div>

            <div>
              <span>FOCUS</span>
              <strong>Inflammation &amp; Cell Survival</strong>
            </div>
          </aside>
        </div>

        <div className="research-methods">
          <p className="section-label">TECHNIQUES &amp; METHODS</p>

          <div className="research-tags">
            <span>Mammalian cell culture</span>
            <span>Aseptic technique</span>
            <span>Cryopreservation</span>
            <span>PCR</span>
            <span>DNA extraction</span>
            <span>SDS-PAGE</span>
            <span>Western blotting</span>
            <span>Microscopy</span>
            <span>GLP documentation</span>
          </div>
        </div>

        {/* DORSEY LAB PHOTOGRAPHS */}
        <div className="presentation-section">
          <p className="section-label">IN THE LAB</p>

          <div className="presentation-photo-grid">
            <div className="photo-placeholder">
              <img
                src="/research/lab-photos/molecular-toxicology-lab.jpg"
                alt="Kondwani in the Molecular Toxicology Research Laboratory"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="photo-placeholder">
              <img
                src="/research/lab-photos/molecular-toxicology-lab2.jpg"
                alt="Kondwani working in the Molecular Toxicology Research Laboratory"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT 02: DR. DOUGLAS */}
      <section id="douglas" className="research-project alternate-project">
        <div className="research-project-heading">
          <div>
            <p className="section-label">RESEARCH PROJECT 02</p>
            <h2>Environmental Biology</h2>
            <p className="research-supervisor">
              Dr. Hector Douglas III · Grambling State University
            </p>

            <p className="research-lab-name">
              Grambling State University Environment &amp; Developmental Biology Lab
            </p>
          </div>

          <span className="research-year">2025 – PRESENT</span>
        </div>

        <div className="research-project-body">
          <div className="research-main-copy">
            <p className="research-kicker">
              TROPICAL SEABIRD PHYSIOLOGY
            </p>

            <h3>
              Understanding physiological stress in seabirds
              during and after marine heatwave conditions.
            </h3>

            <p>
              This research investigates differences in physiological
              stress and oxidative balance in tropical seabirds from
              Culebra, Puerto Rico. The project examines three species:
              Sooty terns, White-tailed tropicbirds, and Brown noddies.
            </p>

            <p>
              One part of the study compares samples collected during
              the 2024 El Niño period with those collected in 2025
              during La Niña conditions. The broader question is how
              changing environmental conditions may be associated
              with differences in seabird physiological health.
            </p>

            <p>
              My laboratory work has included processing feather
              samples for corticosterone extraction and quantification,
              as well as conducting assays on bird blood plasma to
              investigate oxidative stress and antioxidant capacity.
            </p>

            <p>
              I have also worked with ELISA, fluorescence plate-reader
              measurements, TBARS assays, and data analysis using
              Microsoft Excel and Python. These measurements provide
              different perspectives on physiological stress,
              oxidative damage, and antioxidant defenses.
            </p>
          </div>

          <aside className="research-facts">
            <div>
              <span>LABORATORY</span>
              <strong>Grambling State University Environment &amp; Developmental Biology Lab</strong>
            </div>

            <div>
              <span>SPECIES</span>
              <strong>Sooty tern, White-tailed tropicbird, Brown noddy</strong>
            </div>

            <div>
              <span>COMPARISON</span>
              <strong>2024 El Niño / 2025 La Niña</strong>
            </div>

            <div>
              <span>RESEARCH FOCUS</span>
              <strong>Stress Physiology &amp; Oxidative Balance</strong>
            </div>
          </aside>
        </div>

        {/* DOUGLAS RESEARCH MEASUREMENTS */}
        <div className="research-methods">
          <p className="section-label">WHAT WE MEASURE</p>

          <div className="measurement-grid">
            <article>
              <span>01</span>
              <h3>Corticosterone</h3>
              <p>
                A stress hormone measured in feathers to investigate
                hormonal exposure during feather growth.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>TBARS</h3>
              <p>
                An assay used to assess substances associated with
                lipid peroxidation and oxidative damage.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Total Antioxidant Capacity</h3>
              <p>
                A measurement of the overall antioxidant capacity
                of biological samples.
              </p>
            </article>
          </div>
        </div>

        <div className="research-methods">
          <p className="section-label">TECHNIQUES &amp; METHODS</p>

          <div className="research-tags">
            <span>Feather processing</span>
            <span>Corticosterone extraction</span>
            <span>ELISA</span>
            <span>TBARS assays</span>
            <span>Total antioxidant assays</span>
            <span>Fluorescence plate reader</span>
            <span>Spectrophotometry</span>
            <span>Python / Pandas</span>
            <span>Microsoft Excel</span>
          </div>
        </div>

        {/* DOUGLAS POSTERS */}
        <div className="poster-section">
          <div className="poster-heading">
            <div>
              <p className="section-label">RESEARCH PRESENTATIONS</p>
              <h3>Taking the research beyond the lab.</h3>
            </div>

            <span>02 POSTERS</span>
          </div>

          <div className="poster-grid">
            <article className="poster-card">
              <div className="poster-placeholder">
                <img
                  src="/research/posters/2025undergraduate_symposium_poster.jpg"
                  alt="2025 GSU Undergraduate Research Symposium poster on seabird stress and condition"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className="poster-caption">
                <p className="poster-event">
                  2025 · GSU UNDERGRADUATE RESEARCH SYMPOSIUM
                </p>

                <h4>
                  Stress and Condition in Relation to Diet in
                  Seabirds at Culebra, Puerto Rico.
                </h4>

                <p>
                  Phiri, K. L., Breakfield, M., Gyebi, B., &amp; Douglas, H.
                </p>
              </div>
            </article>

            <article className="poster-card">
              <div className="poster-placeholder">
                <img
                  src="/research/posters/las100_poster.jpg"
                  alt="2026 Louisiana Academy of Sciences poster on tropical seabird stress during and after a marine heatwave"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className="poster-caption">
                <p className="poster-event">
                  2026 · CENTENNIAL MEETING OF THE LOUISIANA ACADEMY OF SCIENCES
                </p>

                <h4>
                  Contrast in Condition and Stress of Tropical
                  Seabirds During and After a Marine Heat Wave.
                </h4>

                <p>
                  Phiri, K. L., Breakfield, M., Gyebi, B., &amp; Douglas, H.
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* DOUGLAS PRESENTATION PHOTOS */}
        <div className="presentation-section">
          <p className="section-label">PRESENTATION PHOTOGRAPHS</p>

          <div className="presentation-photo-grid">
            <div className="photo-placeholder">
              <img
                src="/research/presentations/undergrad_symposium.jpeg"
                alt="Kondwani presenting research at the GSU Undergraduate Research Symposium"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="photo-placeholder">
              <img
                src="/research/presentations/las100.jpeg"
                alt="Kondwani presenting research at the Louisiana Academy of Sciences meeting"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT 03: DR. YANG */}
      <section id="yang" className="research-project">
        <div className="research-project-heading">
          <div>
            <p className="section-label">RESEARCH PROJECT 03</p>
            <h2>Quantum Dots &amp; Solar Cells</h2>
            <p className="research-supervisor">
              Dr. Yang Haeyeon · Grambling State University
            </p>
          </div>

          <span className="research-year">FALL 2024</span>
        </div>

        <div className="research-project-body">
          <div className="research-main-copy">
            <p className="research-kicker">
              MATERIALS SCIENCE · RENEWABLE ENERGY
            </p>

            <h3>
              Exploring how quantum dots could help solar cells
              capture more of the light around them.
            </h3>

            <p>
              Under Dr. Yang Haeyeon, I led a team of five in
              evaluating the potential of quantum dots as wavelength
              conversion materials for solar cells.
            </p>

            <p>
              Using existing quantum-dot wavelength data in Microsoft
              Excel, I modeled how different quantum dots could
              influence the wavelengths of light reaching a solar cell.
              The analysis focused on cutting out wavelengths between
              620–800 nm and increasing the light available for
              absorption in the 450–500 nm range.
            </p>

            <p>
              Through this process, we identified three quantum dots
              that were theoretically suited to these goals and
              developed a theoretical model suggesting a 2% improvement
              in power generation.
            </p>

            <p>
              This project gave me the opportunity to work with a team,
              interpret scientific data, and explore how material
              properties could be applied to an energy challenge.
            </p>
          </div>

          <aside className="research-facts">
            <div>
              <span>TEAM</span>
              <strong>Five Researchers</strong>
            </div>

            <div>
              <span>RESEARCH MATERIAL</span>
              <strong>Quantum Dots</strong>
            </div>

            <div>
              <span>APPLICATION</span>
              <strong>Wavelength Conversion for Solar Cells</strong>
            </div>

            <div>
              <span>THEORETICAL MODEL</span>
              <strong>2% Potential Power Generation Improvement</strong>
            </div>
          </aside>
        </div>

        <div className="research-methods">
          <p className="section-label">PROJECT FOCUS</p>

          <div className="research-tags">
            <span>Quantum dots</span>
            <span>Wavelength conversion</span>
            <span>Solar-cell efficiency</span>
            <span>Microsoft Excel</span>
            <span>Data modeling</span>
            <span>Team leadership</span>
          </div>
        </div>

        {/* YANG POSTER */}
        <div className="poster-section">
          <div className="poster-heading">
            <div>
              <p className="section-label">RESEARCH PRESENTATION</p>
              <h3>Project poster.</h3>
            </div>

            <span>01 POSTER</span>
          </div>

          <div className="poster-grid single-poster">
            <article className="poster-card">
              <div className="poster-placeholder">
                <img
                  src="/research/posters/quantum_dot_solarcell_poster.jpg"
                  alt="Quantum Dots as Wavelength Conversion Material for Solar Cells research poster"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className="poster-caption">
                <p className="poster-event">
                  FALL 2024 · RESEARCH PROJECT
                </p>

                <h4>
                  Quantum Dots as Wavelength Conversion Material
                  for Solar Cells.
                </h4>

                <p>
                  Research conducted under Dr. Yang Haeyeon.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* RESEARCH PAGE FOOTER */}
      <footer className="site-footer">
        <a href="/" className="wordmark">
          Kondwani Phiri<span>.</span>
        </a>

        <p>
          Thanks for taking the time to explore my research.
        </p>

        <a href="/" className="text-link">
          Back to the main site ↗
        </a>
      </footer>

    </main>
  );
}
