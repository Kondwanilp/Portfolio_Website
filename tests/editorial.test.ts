import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { MOTION_DURATION_MS, shouldPlayMotion, TRANSLATION } from "../lib/motion.ts";

test("scientific entrances respect motion preferences and the session replay boundary", () => {
  assert.equal(shouldPlayMotion(false, false), true);
  assert.equal(shouldPlayMotion(true, false), false);
  assert.equal(shouldPlayMotion(false, true), false);
  assert.equal(shouldPlayMotion(true, true), false);
  assert.ok(MOTION_DURATION_MS >= 1500 && MOTION_DURATION_MS <= 3000);
});

test("translation starts at AUG, uses complementary antiparallel tRNAs, and terminates without a stop amino acid", () => {
  const code: Record<string, string> = { AUG: "Met", GCU: "Ala", UUU: "Phe", GGA: "Gly" };
  const complement: Record<string, string> = { A: "U", U: "A", G: "C", C: "G" };
  assert.equal(TRANSLATION[0].codon, "AUG");
  for (const unit of TRANSLATION.slice(0, -1)) {
    assert.equal(unit.aminoAcid, code[unit.codon]);
    assert.equal(unit.anticodon, [...unit.codon].map(base => complement[base]).join(""));
  }
  const stop = TRANSLATION.at(-1)!;
  assert.ok(["UAA", "UAG", "UGA"].includes(stop.codon));
  assert.equal(stop.anticodon, null);
  assert.equal(stop.aminoAcid, null);
});

test("the redesign preserves factual content and the approved public copy revisions", async () => {
  const baseline = JSON.parse(await readFile(new URL("./fixtures/editorial-content.json", import.meta.url), "utf8")) as Record<string, string[]>;
  for (const [file, passages] of Object.entries(baseline)) {
    // The approved short cover moves content to real destinations; retain every fixture passage.
    const files = file === "app/page.tsx" ? [file, "app/about/page.tsx", "app/components/ExperienceTimeline.tsx", "app/components/LeadershipTimeline.tsx", "app/components/PersonalInterests.tsx", "app/components/SiteFooter.tsx"] : file === "app/research/page.tsx" ? [file, "app/components/ResearchCaseFiles.tsx"] : [file];
    const source = (await Promise.all(files.map(path => readFile(new URL(`../${path}`, import.meta.url), "utf8")))).join(" ").replace(/\s+/g, " ");
    for (const passage of passages) assert.ok(source.includes(passage.replace(/\s+/g, " ").trim()), `${file} lost ${passage.trim().slice(0, 80)}`);
  }
});

test("motion retains complete static figures, finite animations and offscreen/reduced-motion fallbacks", async () => {
  const css = await readFile(new URL("../app/motion.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\binfinite\b/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /animation-play-state: paused/);
  const component = await readFile(new URL("../app/components/ScientificMotion.tsx", import.meta.url), "utf8");
  assert.match(component, /data-motion="settled"/);
  assert.match(component, /observer\.disconnect\(\)/);
  assert.match(component, /clearTimeout\(timer\)/);
  assert.match(component, /Skip animation/);
});

test("normal editorial text tokens meet 4.5 to 1 contrast on both paper surfaces", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  function luminance(token: string) {
    const color = css.match(new RegExp(`--${token}: #([0-9a-f]{6})`))?.[1];
    assert.ok(color, token);
    const channels = [0, 2, 4].map(offset => {
      const channel = parseInt(color.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  for (const surface of ["background", "paper"]) {
    for (const ink of ["foreground", "text-secondary", "text-muted", "sage-ink"]) {
      assert.ok((luminance(surface) + 0.05) / (luminance(ink) + 0.05) >= 4.5, `${ink} on ${surface}`);
    }
  }
});

test("legacy Extras links retain server boundaries and open the unified page with deferred activities", async () => {
  const route = await readFile(new URL("../app/extras/[channel]/page.tsx", import.meta.url), "utf8");
  const view = await readFile(new URL("../app/extras/ExtrasView.tsx", import.meta.url), "utf8");
  const activities = await readFile(new URL("../app/extras/ExtrasActivities.tsx", import.meta.url), "utf8");
  assert.match(route, /function ChannelContent[\s\S]*await params/);
  assert.match(route, /<Suspense[\s\S]*<ChannelContent params=\{params\}/);
  assert.match(route, /redirect\(`\/extras#/);
  assert.match(view, /<Suspense[^]*?<PublishedCollection[^]*?<\/Suspense>/);
  for (const component of ["ChessCorner", "CourtVision"]) assert.ok(activities.includes(`dynamic(() => import("./${component}")`));
});
