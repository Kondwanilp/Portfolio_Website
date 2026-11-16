import assert from "node:assert/strict";
import test from "node:test";
import { clampProgress, ENERGY_PARTICLES, INNER_MEMBRANE, LIVING_DURATION, livingReveal, OUTER_MEMBRANE, particlePosition, TRANSLATION_SEQUENCE, translationPhase } from "../lib/living-matter.ts";
import { livingNavigation, livingSessionKey, type NavigationGesture } from "../lib/living-navigation.ts";
import { runLivingTimeline, type TimelineClock } from "../lib/living-timeline.ts";

type Point = { x: number; y: number };

// Sample the actual authored cubic paths to catch accidental open/crossing folds
// or an inner membrane escaping its containing outer membrane after an edit.
function sampleMembrane(path: string): Point[] {
  const tokens = path.match(/[MCZ]|-?\d+(?:\.\d+)?/g)!;
  const points: Point[] = [];
  let cursor = { x: 0, y: 0 };
  let index = 0;
  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") {
      cursor = { x: Number(tokens[index++]), y: Number(tokens[index++]) };
      points.push(cursor);
    } else if (command === "C") {
      const start = cursor;
      const a = { x: Number(tokens[index++]), y: Number(tokens[index++]) };
      const b = { x: Number(tokens[index++]), y: Number(tokens[index++]) };
      const end = { x: Number(tokens[index++]), y: Number(tokens[index++]) };
      for (let step = 1; step <= 16; step++) {
        const t = step / 16; const u = 1 - t;
        points.push({ x: u ** 3 * start.x + 3 * u ** 2 * t * a.x + 3 * u * t ** 2 * b.x + t ** 3 * end.x, y: u ** 3 * start.y + 3 * u ** 2 * t * a.y + 3 * u * t ** 2 * b.y + t ** 3 * end.y });
      }
      cursor = end;
    } else if (command === "Z") {
      if (cursor.x !== points[0].x || cursor.y !== points[0].y) points.push(points[0]);
    } else assert.fail("Unexpected command in normalized membrane geometry");
  }
  return points;
}

function inside(point: Point, polygon: Point[]) {
  let contained = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]; const b = polygon[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) contained = !contained;
  }
  return contained;
}

function orientation(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function hasCrossing(points: Point[]) {
  for (let i = 0; i < points.length - 1; i++) for (let j = i + 2; j < points.length - 1; j++) {
    const [a, b, c, d] = [points[i], points[i + 1], points[j], points[j + 1]];
    if (orientation(a, b, c) * orientation(a, b, d) < -1e-8 && orientation(c, d, a) * orientation(c, d, b) < -1e-8) return true;
  }
  return false;
}

test("the authored crista boundary is continuous, does not cross itself, and stays inside the outer membrane", () => {
  const outer = sampleMembrane(OUTER_MEMBRANE);
  const inner = sampleMembrane(INNER_MEMBRANE);
  for (const polygon of [outer, inner]) {
    assert.deepEqual(polygon[0], polygon.at(-1), "The membrane must remain a closed boundary");
    assert.equal(hasCrossing(polygon), false, "A membrane must not cross its own folds");
    assert.ok(polygon.every(point => point.x > 0 && point.x < 1000 && point.y > 0 && point.y < 650));
  }
  assert.ok(inner.every(point => inside(point, outer)), "Cristae and inner membrane must stay contained");
});

test("the shared revelation stays finite, bounded and monotonic at both sequence boundaries", () => {
  assert.equal(LIVING_DURATION, 2500);
  for (const kind of ["research", "about"] as const) {
    let previous = 0;
    for (let frame = -20; frame <= 120; frame++) {
      const reveal = livingReveal(frame / 100, kind);
      assert.ok(Number.isFinite(reveal) && reveal >= previous && reveal >= 0 && reveal <= 1);
      previous = reveal;
    }
    assert.equal(livingReveal(-1, kind), 0);
    assert.equal(livingReveal(1, kind), 1);
    assert.equal(livingReveal(2, kind), 1);
    for (const invalid of [NaN, Infinity, -Infinity]) assert.equal(livingReveal(invalid, kind), 0);
  }
  assert.equal(clampProgress(-1), 0);
  assert.equal(clampProgress(2), 1);
});

test("seeded particles stay within safe scene bounds and produce repeatable paths without radial uniformity", () => {
  assert.ok(ENERGY_PARTICLES.length <= 32);
  const startHeights = new Set<number>();
  for (let index = 0; index < ENERGY_PARTICLES.length; index++) {
    startHeights.add(Math.round(ENERGY_PARTICLES[index].start.y));
    for (let frame = 0; frame <= 100; frame++) {
      const progress = frame / 100;
      const position = particlePosition(index, progress);
      assert.deepEqual(position, particlePosition(index, progress), "Replay must use the same seeded positions");
      assert.ok(Number.isFinite(position.x) && Number.isFinite(position.y));
      assert.ok(position.x >= 0 && position.x <= 1000 && position.y >= 0 && position.y <= 650);
      assert.ok(position.opacity >= 0 && position.opacity <= 1);
    }
    assert.equal(particlePosition(index, 0).opacity, 0);
    assert.ok(particlePosition(index, 1).opacity < 1e-10);
  }
  assert.ok(startHeights.size > ENERGY_PARTICLES.length / 2, "Particles should not share a rigid alignment");
});

test("translation advances 5′ to 3′, produces exactly the encoded peptide, and releases at a stop without another amino acid", () => {
  const geneticCode: Record<string, string> = { AUG: "Met", GCU: "Ala", UUU: "Phe", GGU: "Gly" };
  assert.equal(TRANSLATION_SEQUENCE[0].codon, "AUG");
  for (const unit of TRANSLATION_SEQUENCE.slice(0, -1)) assert.equal(unit.aminoAcid, geneticCode[unit.codon]);
  assert.equal(TRANSLATION_SEQUENCE.at(-1)?.codon, "UAA");
  assert.equal(TRANSLATION_SEQUENCE.at(-1)?.aminoAcid, null);
  let lastX = 0; let lastCount = 0;
  for (let frame = 0; frame <= 1000; frame++) {
    const phase = translationPhase(frame / 1000);
    assert.ok(phase.x >= lastX, "Ribosome must not move backward along the codon track");
    assert.ok(phase.count >= lastCount && phase.count <= 4);
    assert.ok(phase.codon >= 0 && phase.codon <= 4 && phase.fraction >= 0 && phase.fraction <= 1);
    if (phase.codon === 4) { assert.equal(phase.count, 4); assert.equal(TRANSLATION_SEQUENCE[phase.codon].aminoAcid, null); }
    lastX = phase.x; lastCount = phase.count;
  }
  assert.equal(translationPhase(0).count, 0);
  assert.equal(translationPhase(1).count, 4);
});

test("navigation enhancements preserve modifier clicks, downloads, external sites and in-document deep links", () => {
  const current = "https://portfolio.example/";
  const ordinary: NavigationGesture = { button: 0 };
  assert.equal(livingNavigation("/research", current, ordinary), "research");
  assert.equal(livingNavigation("/about", current, ordinary), "about");
  assert.equal(livingNavigation("/#about", current, ordinary), "about");
  assert.equal(livingNavigation("/research?method=ELISA", current, ordinary), "research");
  for (const gesture of [{ button: 1 }, { button: 2 }, { button: 0, metaKey: true }, { button: 0, ctrlKey: true }, { button: 0, shiftKey: true }, { button: 0, altKey: true }, { button: 0, target: "_blank" }, { button: 0, download: true }]) {
    assert.equal(livingNavigation("/research", current, gesture), null);
  }
  for (const href of ["https://elsewhere.example/research", "/research#methods", "/about#origins", "/cv.pdf", "mailto:person@example.test", "https://["]) assert.equal(livingNavigation(href, current, ordinary), null);
  assert.equal(livingNavigation("/extras/chess", current, ordinary), "chess");
  assert.equal(livingNavigation("/extras/listening", current, ordinary), "listening");
  assert.equal(livingNavigation("/experience", current, ordinary), "experience");
  assert.equal(livingNavigation("/leadership", current, ordinary), "leadership");
  assert.equal(livingNavigation("/research", current + "research", ordinary), null);
  assert.notEqual(livingSessionKey("research"), livingSessionKey("about"), "Each deliberate destination receives an independent replay boundary");
});

function fixtureClock() {
  let sequence = 0;
  const callbacks = new Map<number, (time: number) => void>();
  const clock: TimelineClock = {
    request(callback) { const id = ++sequence; callbacks.set(id, callback); return id; },
    cancel(id) { callbacks.delete(id); },
  };
  return {
    clock, callbacks,
    frame(time: number) { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(time)); },
  };
}

test("the shared clock completes once at the endpoint and cancels queued work", () => {
  const fixture = fixtureClock(); const frames: number[] = []; let completed = 0;
  const timeline = runLivingTimeline(progress => frames.push(progress), () => completed++, 2500, fixture.clock);
  for (let time = 0; time <= 2600; time += 20) fixture.frame(time);
  timeline.finish(); timeline.cancel();
  assert.equal(frames[0], 0);
  assert.equal(frames.at(-1), 1);
  assert.equal(completed, 1);
  assert.equal(fixture.callbacks.size, 0);
  assert.ok(frames.every((frame, index) => frame >= 0 && frame <= 1 && (index === 0 || frame >= frames[index - 1])));
});

test("interruption rejects stale frames, and an exceptional frame settles instead of retaining a curtain", () => {
  const fixture = fixtureClock(); let frames = 0; let completed = 0;
  const timeline = runLivingTimeline(() => frames++, () => completed++, 2500, fixture.clock);
  const staleFrame = [...fixture.callbacks.values()][0];
  timeline.cancel(); staleFrame(20); timeline.finish();
  assert.equal(frames, 0);
  assert.equal(completed, 0, "Cancellation must not call a stale completion against a new destination");
  assert.equal(fixture.callbacks.size, 0);
  const exceptional = runLivingTimeline(() => { throw new Error("Unavailable renderer resource"); }, () => completed++, 2500, fixture.clock);
  fixture.frame(0); exceptional.finish();
  assert.equal(completed, 1);
  assert.equal(fixture.callbacks.size, 0);
});

test("a suspended or reordered clock cannot cause a flash or negative motion", () => {
  const fixture = fixtureClock(); const frames: number[] = [];
  const timeline = runLivingTimeline(progress => frames.push(progress), () => {}, 2500, fixture.clock);
  fixture.frame(0); fixture.frame(10000); fixture.frame(9990);
  assert.deepEqual(frames, [0, .04, .04], "A long stall contributes at most 100ms; backwards time contributes nothing");
  timeline.finish();
  assert.equal(fixture.callbacks.size, 0);
});
