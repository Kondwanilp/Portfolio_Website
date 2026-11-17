import Image from "next/image";
import ImageLightbox from "./ImageLightbox";
import quantumDotPoster from "../../public/research/posters/quantum_dot_solarcell_poster.jpg";
import academyPresentation from "../../public/research/presentations/las100.jpeg";
import undergraduatePresentation from "../../public/research/presentations/undergrad_symposium.jpeg";
import seabirdHeatwavePoster from "../../public/research/posters/las100_poster.jpg";
import undergraduatePoster from "../../public/research/posters/2025undergraduate_symposium_poster.jpg";
import toxicologyWorkPhoto from "../../public/research/lab-photos/molecular-toxicology-lab2.jpg";
import toxicologyLabPhoto from "../../public/research/lab-photos/molecular-toxicology-lab.jpg";

/** Authentic research documents. Content and original evidence are kept server-rendered. */
export function DorseyResearchFile() {
  return (
      <section data-research-case="dorsey" className="notebook-case-body">
        <div className="notebook-case-heading">
          <div>
            <p className="section-label">RESEARCH PROJECT 01</p>
            <h2>Molecular Toxicology</h2>
            <p className="research-supervisor">
              Dr. Waneene Dorsey · Grambling State University
            </p>
          </div>

          <span className="research-year">2025 – PRESENT</span>
        </div>

        <figure className="dossier-lead-image"><ImageLightbox source={toxicologyWorkPhoto.src} label="Laboratory work &mdash; view full-size photograph"><Image src={toxicologyWorkPhoto} alt="Kondwani working with samples in the Molecular Toxicology Research Laboratory" sizes="(max-width: 700px) 88vw, 54vw" /></ImageLightbox><figcaption>01 / Molecular Toxicology Laboratory &middot; Grambling State University</figcaption></figure>

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

        <details className="research-methods"><summary>Explore the methods and tools</summary>
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
        </details>

        {/* DORSEY LAB PHOTOGRAPHS */}
        <details className="research-supporting-details"><summary>Laboratory &amp; presentation photographs</summary>
<div className="presentation-section">
          <p className="section-label">IN THE LAB</p>

          <div className="presentation-photo-grid">
            <ImageLightbox source={toxicologyLabPhoto.src} label="Molecular Toxicology Laboratory - view full-size photograph">
              <Image
                src={toxicologyLabPhoto} sizes="(max-width: 600px) 86vw, 42vw"
                alt="Kondwani in the Molecular Toxicology Research Laboratory"
                style={{
                    aspectRatio: toxicologyLabPhoto.width / toxicologyLabPhoto.height,
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </ImageLightbox>

            <ImageLightbox source={toxicologyWorkPhoto.src} label="Molecular toxicology laboratory work - view full-size photograph">
              <Image
                src={toxicologyWorkPhoto} sizes="(max-width: 600px) 86vw, 42vw"
                alt="Kondwani working in the Molecular Toxicology Research Laboratory"
                style={{
                    aspectRatio: toxicologyWorkPhoto.width / toxicologyWorkPhoto.height,
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </ImageLightbox>
          </div>
        </div>
        </details>
      </section>
  );
}

export function DouglasResearchFile() {
  return (
      <section data-research-case="douglas" className="notebook-case-body">
        <div className="notebook-case-heading">
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

        <figure className="dossier-lead-image"><ImageLightbox source={academyPresentation.src} label="Research presentation &mdash; view full-size photograph"><Image src={academyPresentation} alt="Kondwani presenting seabird research at the Louisiana Academy of Sciences" sizes="(max-width: 700px) 88vw, 54vw" /></ImageLightbox><figcaption>02 / Louisiana Academy of Sciences &middot; 2026</figcaption></figure>

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
        <details className="research-methods"><summary>Explore the physiological measurements</summary>
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
        </details>

        <details className="research-methods"><summary>Explore the methods and tools</summary>
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
        </details>

        {/* DOUGLAS POSTERS */}
        <details className="research-supporting-details"><summary>Research posters &amp; presentation records</summary>
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
              <ImageLightbox source={undergraduatePoster.src} label="Stress and Condition in Relation to Diet in Seabirds at Culebra, Puerto Rico - view full-size poster">
                <Image
                  src={undergraduatePoster} sizes="(max-width: 600px) 86vw, 42vw"
                  alt="2025 GSU Undergraduate Research Symposium poster on seabird stress and condition"
                  style={{
                    aspectRatio: undergraduatePoster.width / undergraduatePoster.height,
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </ImageLightbox>

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
              <ImageLightbox source={seabirdHeatwavePoster.src} label="Contrast in Condition and Stress of Tropical Seabirds During and After a Marine Heat Wave - view full-size poster">
                <Image
                  src={seabirdHeatwavePoster} sizes="(max-width: 600px) 86vw, 42vw"
                  alt="2026 Louisiana Academy of Sciences poster on tropical seabird stress during and after a marine heatwave"
                  style={{
                    aspectRatio: seabirdHeatwavePoster.width / seabirdHeatwavePoster.height,
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </ImageLightbox>

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
        </details>

        {/* DOUGLAS PRESENTATION PHOTOS */}
        <details className="research-supporting-details"><summary>Laboratory &amp; presentation photographs</summary>
<div className="presentation-section">
          <p className="section-label">PRESENTATION PHOTOGRAPHS</p>

          <div className="presentation-photo-grid">
            <ImageLightbox source={undergraduatePresentation.src} label="Undergraduate Research Symposium presentation - view full-size photograph">
              <Image
                src={undergraduatePresentation} sizes="(max-width: 600px) 86vw, 42vw"
                alt="Kondwani presenting research at the GSU Undergraduate Research Symposium"
                style={{
                    aspectRatio: undergraduatePresentation.width / undergraduatePresentation.height,
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </ImageLightbox>

            <ImageLightbox source={academyPresentation.src} label="Louisiana Academy of Sciences presentation - view full-size photograph">
              <Image
                src={academyPresentation} sizes="(max-width: 600px) 86vw, 42vw"
                alt="Kondwani presenting research at the Louisiana Academy of Sciences meeting"
                style={{
                    aspectRatio: academyPresentation.width / academyPresentation.height,
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </ImageLightbox>
          </div>
        </div>
        </details>
      </section>
  );
}

export function YangResearchFile() {
  return (
      <section data-research-case="yang" className="notebook-case-body">
        <div className="notebook-case-heading">
          <div>
            <p className="section-label">RESEARCH PROJECT 03</p>
            <h2>Quantum Dots &amp; Solar Cells</h2>
            <p className="research-supervisor">
              Dr. Yang Haeyeon · Grambling State University
            </p>
          </div>

          <span className="research-year">FALL 2024</span>
        </div>

        <figure className="dossier-lead-image dossier-poster"><ImageLightbox source={quantumDotPoster.src} label="Quantum-dot project poster &mdash; view full-size poster"><Image src={quantumDotPoster} alt="Research poster for Quantum Dots as Wavelength Conversion Material for Solar Cells" sizes="(max-width: 700px) 88vw, 54vw" /></ImageLightbox><figcaption>03 / Quantum Dots &amp; Solar Cells &middot; Fall 2024</figcaption></figure>

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

        <details className="research-methods"><summary>Explore the methods and tools</summary>
          <p className="section-label">PROJECT FOCUS</p>

          <div className="research-tags">
            <span>Quantum dots</span>
            <span>Wavelength conversion</span>
            <span>Solar-cell efficiency</span>
            <span>Microsoft Excel</span>
            <span>Data modeling</span>
            <span>Team leadership</span>
          </div>
        </details>

        {/* YANG POSTER */}
        <details className="research-supporting-details"><summary>Research posters &amp; presentation records</summary>
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
              <ImageLightbox source={quantumDotPoster.src} label="Quantum Dots as Wavelength Conversion Material for Solar Cells - view full-size poster">
                <Image
                  src={quantumDotPoster} sizes="(max-width: 600px) 86vw, 42vw"
                  alt="Quantum Dots as Wavelength Conversion Material for Solar Cells research poster"
                  style={{
                    aspectRatio: quantumDotPoster.width / quantumDotPoster.height,
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </ImageLightbox>

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
        </details>
      </section>
  );
}
