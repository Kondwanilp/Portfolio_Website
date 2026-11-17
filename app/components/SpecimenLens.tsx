"use client";

import { useEffect, useRef } from "react";

const cells = [
  [0.04, 0.08, 0.18],
  [0.38, 0.04, 0.18],
  [0.76, 0.02, 0.19],
  [1.05, 0.24, 0.18],
  [0.15, 0.44, 0.2],
  [0.55, 0.36, 0.2],
  [0.86, 0.57, 0.18],
  [0.02, 0.83, 0.19],
  [0.4, 0.8, 0.2],
  [0.72, 1.01, 0.2],
  [1.08, 0.95, 0.19],
];

/** A decorative cell illustration, rendered only while visible. */
export default function SpecimenLens() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const size = 400;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    element.width = size * ratio;
    element.height = size * ratio;
    context.scale(ratio, ratio);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    let lastFrame = 0;
    let cameraX = 0;
    let cameraY = 0;

    function draw(time: number) {
      if (!context) return;
      const phase = motion.matches ? 0 : time / 1000;
      cameraX += (pointer.current.x - cameraX) * 0.04;
      cameraY += (pointer.current.y - cameraY) * 0.04;
      context.clearRect(0, 0, size, size);
      const background = context.createRadialGradient(
        140,
        130,
        10,
        200,
        200,
        300,
      );
      background.addColorStop(0, "#3c695d");
      background.addColorStop(1, "#102f2b");
      context.fillStyle = background;
      context.fillRect(0, 0, size, size);
      cells.forEach(([originX, originY, radius], index) => {
        const x = originX * size + Math.sin(phase * 0.18 + index) * 7 + cameraX;
        const y = originY * size + Math.cos(phase * 0.16 + index) * 7 + cameraY;
        const r = radius * size;
        context.save();
        context.translate(x, y);
        context.rotate(
          Math.sin(index * 2) * 0.4 + Math.sin(phase * 0.08) * 0.025,
        );
        const body = context.createRadialGradient(
          -r * 0.3,
          -r * 0.3,
          4,
          0,
          0,
          r,
        );
        body.addColorStop(0, "#afc6a9");
        body.addColorStop(0.65, "#7ba48b");
        body.addColorStop(0.92, "#466f60");
        body.addColorStop(1, "#c4c7a0");
        context.beginPath();
        for (let point = 0; point <= 48; point++) {
          const angle = (point / 48) * Math.PI * 2;
          const edge = r * (1 + 0.035 * Math.sin(angle * 5 + index));
          const px = Math.cos(angle) * edge;
          const py = Math.sin(angle) * edge * 0.84;
          if (point === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }
        context.closePath();
        context.fillStyle = body;
        context.fill();
        context.strokeStyle = "#d8dbc08c";
        context.lineWidth = 1.1;
        context.stroke();
        for (let grain = 0; grain < 38; grain++) {
          const angle = grain * 2.399 + index;
          const distance = Math.sqrt((grain + 0.5) / 38) * r * 0.79;
          context.fillStyle = grain % 3 === 0 ? "#eadaba42" : "#284d4240";
          context.beginPath();
          context.ellipse(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance * 0.82,
            1.6,
            0.9,
            angle,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
        const nucleus = context.createRadialGradient(
          -12,
          -12,
          2,
          -4,
          -3,
          r * 0.32,
        );
        nucleus.addColorStop(0, "#b78d82");
        nucleus.addColorStop(0.7, "#836c69");
        nucleus.addColorStop(1, "#496455");
        context.fillStyle = nucleus;
        context.beginPath();
        context.ellipse(-4, -3, r * 0.3, r * 0.26, -0.3, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#d3c9ad66";
        context.stroke();
        context.fillStyle = "#4e514a";
        context.beginPath();
        context.arc(-10, -8, r * 0.075, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });
      const vignette = context.createRadialGradient(
        200,
        200,
        100,
        200,
        200,
        215,
      );
      vignette.addColorStop(0, "#071d1800");
      vignette.addColorStop(1, "#071d18b0");
      context.fillStyle = vignette;
      context.fillRect(0, 0, size, size);
    }

    function animate(time: number) {
      frame = 0;
      if (!visible || document.hidden || motion.matches) return;
      if (time - lastFrame >= 32) {
        draw(time);
        lastFrame = time;
      }
      frame = window.requestAnimationFrame(animate);
    }
    function update() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      draw(performance.now());
      if (visible && !document.hidden && !motion.matches)
        frame = window.requestAnimationFrame(animate);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    draw(0);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      width={400}
      height={400}
      aria-hidden="true"
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 20,
          y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 20,
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    />
  );
}
