"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import SpecimenLens from "./SpecimenLens";

const slides = [
  { href: "/about", label: "About", color: "#b7836f" },
  { href: "/research", label: "Research", color: "#6d998a" },
  { href: "/leadership", label: "Leadership", color: "#b79f64" },
  { href: "/extras", label: "Extras", color: "#8983a8" },
];

export default function LabHome() {
  const [active, setActive] = useState(1);
  const [focus, setFocus] = useState(80);

  return (
    <section className="lab-exhibition" aria-labelledby="lab-title">
      <div className="lab-introduction">
        <p className="lab-eyebrow">Lusaka roots. Grambling days.</p>
        <h1 id="lab-title">
          Kondwani
          <br />
          <em>Phiri.</em>
        </h1>
        <p className="lab-identity">
          Biology student.
          <br />
        {" "}Computer science minor.
        </p>
        <p className="lab-university">Grambling State University</p>
      </div>
      <div
        className="lab-still-life"
        style={
          {
            "--lens-hue": `${(active - 1) * 22}deg`,
            "--lens-blur": `${(100 - focus) / 40}px`,
          } as CSSProperties
        }
      >
        <div className="lab-light-pool" aria-hidden="true" />
        <figure className="lab-lens">
          <SpecimenLens />
          <figcaption className="sr-only">
            An animated illustration of cells, with an adjustable microscope
            focus.
          </figcaption>
        </figure>
        <div className="lab-instrument" aria-hidden="true">
          <Image
            src="/home/microscope-study.webp"
            alt=""
            fill
            sizes="(max-width: 600px) 54vw, (max-width: 1000px) 42vw, 400px"
            preload
          />
        </div>
        <span className="lab-handwritten" aria-hidden="true">
          Take a closer look.
        </span>
        <label className="lab-focus">
          <span
            className="lab-focus-knob"
            aria-hidden="true"
            style={{ transform: `rotate(${focus * 2}deg)` }}
          />
          <span>Focus</span>
          <input
            type="range"
            min="0"
            max="100"
            value={focus}
            aria-label="Microscope illustration focus"
            onChange={(event) => setFocus(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="lab-slide-tray">
        <div className="lab-tray-heading">
          <p>Choose a slide.</p>
          <span aria-hidden="true">↓</span>
        </div>
        <nav className="lab-slides" aria-label="Choose a specimen to explore">
          {slides.map((slide, index) => (
            <Link
              key={slide.href}
              href={slide.href}
              className={`lab-slide ${active === index ? "lab-slide--active" : ""}`}
              style={
                {
                  "--slide-color": slide.color,
                  "--slide-index": index,
                } as CSSProperties
              }
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span className="slide-specimen" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="lab-slide-label">
                {slide.label}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
