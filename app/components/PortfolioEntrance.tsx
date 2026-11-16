import Image from "next/image";
import portrait from "../../public/Portrait.jpg";
import ScientificMotion from "./ScientificMotion";

export default function PortfolioEntrance() {
  return <ScientificMotion name="portrait">
    <figure className="portrait-study">
      <div className="microscopy-study" aria-hidden="true">
        <svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="172" /><circle cx="200" cy="200" r="155" />
          <path className="draw-line" d="M100 188Q112 119 172 139T273 121Q320 165 280 219T224 299Q159 312 120 268T100 188Z" />
          <ellipse cx="202" cy="207" rx="38" ry="47" /><path d="M190 191Q225 177 213 222M106 88L135 117M298 288L325 315M68 200H92M309 200H334" />
        </svg>
      </div>
      <div className="portrait-print"><Image src={portrait} alt="Kondwani Phiri" sizes="(max-width: 700px) 70vw, 360px" priority /><figcaption>A little bit of everything.</figcaption></div>
      <p className="portrait-note">Lusaka roots.<br />A curious mind, everywhere.</p>
    </figure>
  </ScientificMotion>;
}
