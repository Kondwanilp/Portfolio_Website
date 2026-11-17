"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import coastlines from "@/lib/travel-coastlines.json";
import {
  arrangePins,
  globePath,
  normalizeLongitude,
  projectPlace,
  threadPoints,
  visitedPlaces,
  type GlobeView,
} from "@/lib/travel-globe";
import "./travel-globe.css";

const coast = coastlines.map((ring) =>
  ring.map(([lon, lat]) => ({ lat, lon })),
);
const threads = visitedPlaces
  .slice(1)
  .map((place) => threadPoints(visitedPlaces[0], place));
const graticules = [
  ...[-60, -30, 0, 30, 60].map((lat) =>
    Array.from({ length: 73 }, (_, index) => ({ lat, lon: index * 5 - 180 })),
  ),
  ...[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map((lon) =>
    Array.from({ length: 37 }, (_, index) => ({ lat: index * 5 - 90, lon })),
  ),
];

export default function TravelGlobe() {
  const [view, setView] = useState<GlobeView>({
    longitude: -25,
    latitude: 12,
    zoom: 1,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; view: GlobeView } | null>(null);
  const moved = useRef(false);
  const frame = useRef(0);
  const id = useId().replaceAll(":", "");
  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  const pins = arrangePins(
    visitedPlaces
      .map((place) => ({ ...projectPlace(place, view), name: place.name }))
      .filter(
        (point) =>
          point.front &&
          point.x > 0 &&
          point.x < 360 &&
          point.y > 0 &&
          point.y < 340,
      ),
  );
  const label = pins.find((pin) => pin.name === (hovered ?? selected));
  const labelWidth = label ? Math.min(230, label.name.length * 6.2 + 18) : 0;
  const labelX = label
    ? Math.max(5, Math.min(355 - labelWidth, label.headX - labelWidth / 2))
    : 0;
  const labelY = label ? Math.max(8, Math.min(308, label.headY - 36)) : 0;

  function release(event: PointerEvent<SVGSVGElement>) {
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="travel-globe">
      <h3>Places I’ve been.</h3>
      <svg
        className={dragging ? "travel-globe-dragging" : ""}
        viewBox="0 0 360 340"
        tabIndex={0}
        role="group"
        aria-label="Visited places globe. Drag to rotate, or use the arrow keys. Select a pin for its place name."
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          moved.current = false;
          drag.current = { x: event.clientX, y: event.clientY, view };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.hypot(dx, dy) < 4 && !moved.current) return;
          moved.current = true;
          setDragging(true);
          setHovered(null);
          event.currentTarget.setPointerCapture(event.pointerId);
          window.cancelAnimationFrame(frame.current);
          frame.current = window.requestAnimationFrame(() =>
            setView({
              ...start.view,
              longitude: normalizeLongitude(
                start.view.longitude - (dx * 0.45) / start.view.zoom,
              ),
              latitude: Math.max(
                -70,
                Math.min(
                  70,
                  start.view.latitude + (dy * 0.35) / start.view.zoom,
                ),
              ),
            }),
          );
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={() => {
          drag.current = null;
          setDragging(false);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const steps: Record<string, [number, number]> = {
            ArrowLeft: [-8, 0],
            ArrowRight: [8, 0],
            ArrowUp: [0, 8],
            ArrowDown: [0, -8],
          };
          const step = steps[event.key];
          if (!step) return;
          event.preventDefault();
          setView((previous) => ({
            ...previous,
            longitude: normalizeLongitude(previous.longitude + step[0]),
            latitude: Math.max(-70, Math.min(70, previous.latitude + step[1])),
          }));
        }}
      >
        <defs>
          <radialGradient id={`${id}-ocean`} cx="30%" cy="25%">
            <stop stopColor="#c4d5c2" />
            <stop offset=".7" stopColor="#6b9084" />
            <stop offset="1" stopColor="#304f4c" />
          </radialGradient>
          <radialGradient id={`${id}-pin`} cx="30%" cy="25%">
            <stop stopColor="#f1b59d" />
            <stop offset=".45" stopColor="#bc6551" />
            <stop offset="1" stopColor="#733d32" />
          </radialGradient>
          <clipPath id={`${id}-circle`}>
            <circle cx="180" cy="170" r={145 * view.zoom} />
          </clipPath>
        </defs>
        <circle
          cx="180"
          cy="170"
          r={145 * view.zoom}
          fill={`url(#${id}-ocean)`}
        />
        <g clipPath={`url(#${id}-circle)`} fill="none">
          <g stroke="#e8eadb" strokeOpacity=".23" strokeWidth=".6">
            {graticules.map((line, index) => (
              <path key={index} d={globePath(line, view)} />
            ))}
          </g>
          <g stroke="#e5e5cd" strokeOpacity=".65" strokeWidth=".9">
            {coast.map((ring, index) => (
              <path key={index} d={globePath(ring, view)} />
            ))}
          </g>
          {threads.map((thread, index) => (
            <g key={index}>
              <path
                d={globePath(thread, view)}
                stroke="#24372b"
                strokeWidth="3.4"
                opacity=".3"
                transform="translate(.5 1)"
              />
              <path
                d={globePath(thread, view)}
                stroke="#9b4d38"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={globePath(thread, view)}
                stroke="#e2b28c"
                strokeWidth=".7"
                strokeDasharray=".8 2.2"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
        <circle
          cx="180"
          cy="170"
          r={145 * view.zoom}
          fill="none"
          stroke="#314c43"
        />
        {pins.map((pin) => (
          <g
            key={pin.name}
            className="travel-pin"
            role="button"
            tabIndex={0}
            aria-label={pin.name}
            aria-pressed={selected === pin.name}
            onPointerEnter={() => {
              if (!drag.current) setHovered(pin.name);
            }}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(pin.name)}
            onBlur={() => setHovered(null)}
            onClick={() => {
              if (!moved.current)
                setSelected((previous) =>
                  previous === pin.name ? null : pin.name,
                );
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                setSelected((previous) =>
                  previous === pin.name ? null : pin.name,
                );
              }
            }}
          >
            <circle cx={pin.headX} cy={pin.headY} r="13" fill="transparent" />
            <line
              x1={pin.x}
              y1={pin.y}
              x2={pin.headX}
              y2={pin.headY + 3}
              stroke="#24372b"
              strokeWidth="2.4"
              opacity=".35"
            />
            <line
              x1={pin.x}
              y1={pin.y}
              x2={pin.headX}
              y2={pin.headY + 3}
              stroke="#dbd6c3"
              strokeWidth="1.2"
            />
            <ellipse
              cx={pin.headX + 1}
              cy={pin.headY + 2}
              rx="6"
              ry="5"
              fill="#263e2d"
              opacity=".3"
            />
            <circle
              className="travel-pin-head"
              cx={pin.headX}
              cy={pin.headY}
              r="5.4"
              fill={`url(#${id}-pin)`}
              stroke="#683c31"
              strokeWidth=".7"
            />
            <ellipse
              cx={pin.headX - 1.5}
              cy={pin.headY - 1.7}
              rx="1.8"
              ry="1.1"
              fill="#ffe1bd"
              opacity=".75"
            />
          </g>
        ))}
        {label && (
          <g
            className="travel-pin-label"
            aria-hidden="true"
            transform={`translate(${labelX} ${labelY})`}
          >
            <rect
              width={labelWidth}
              height="26"
              rx="4"
              fill="#fffaf0"
              stroke="#c2c7b4"
            />
            <text x="9" y="17" fill="#304c3c" fontSize="11">
              {label.name}
            </text>
          </g>
        )}
      </svg>
      <div className="travel-globe-controls">
        <span>Drag to turn</span>
        <label>
          Zoom
          <input
            type="range"
            min="1"
            max="3.8"
            step=".05"
            value={view.zoom}
            aria-label="Globe zoom"
            onChange={(event) =>
              setView((previous) => ({
                ...previous,
                zoom: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>
      <span className="sr-only" role="status">
        {selected}
      </span>
    </div>
  );
}
