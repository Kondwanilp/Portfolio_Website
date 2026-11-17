import Image from "next/image";
import ImageLightbox from "./ImageLightbox";
import labPhoto from "../../public/research/lab-photos/molecular-toxicology-lab.jpg";
import symposiumPhoto from "../../public/research/presentations/undergrad_symposium.jpeg";
import academyPhoto from "../../public/research/presentations/las100.jpeg";

export default function PortfolioGallery() {
  return (
        <section id="gallery" className="gallery-section">
          <p>PHOTOGRAPHS / FIELD NOTES</p>
          <h1>Photographs.</h1>
          <p>
            People, places, experiences, research presentations,
            and everything in between.
          </p>
          <div className="contact-sheet">
            {[{ image: labPhoto, title: "Molecular Toxicology Lab", note: "Grambling State University" }, { image: symposiumPhoto, title: "Undergraduate Research Symposium", note: "Research presentation · 2025" }, { image: academyPhoto, title: "Louisiana Academy of Sciences", note: "Centennial meeting · 2026" }].map(({ image, title, note }) => <figure key={image.src}>
              <ImageLightbox source={image.src} label={title}><Image src={image} alt={title} sizes="(max-width: 700px) 90vw, 30vw" /></ImageLightbox>
              <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
            </figure>)}
          </div>
        </section>


  );
}
