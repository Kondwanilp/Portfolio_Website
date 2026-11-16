import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const development = process.argv.includes("--development");
const base = process.env.PORTFOLIO_TEST_URL ?? (development ? "http://127.0.0.1:3000" : "http://127.0.0.1:3101");
const locations = ["view=cover", "view=research", "view=about", "concept=living&view=research", "concept=atlas&view=research"];
for (const query of locations) {
    const response = await fetch(`${base}/motion-lab?${query}`, { signal: AbortSignal.timeout(30000) });
    const html = await response.text();
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    assert.equal(response.status, development ? 200 : 404, query);
    assert.match(html, /name="robots" content="noindex/);
    if (development) {
      assert.match(body, /class="motion-laboratory"/);
      assert.match(body, /Living Matter/);
      assert.match(body, /One approved direction/);
      assert.doesNotMatch(body, /Field Atlas|Creative direction|lab-concept-options/);
      assert.match(body, /aria-label="Motion review controls"/);
      assert.match(body, /Reduced-motion preview/);
      assert.match(body, /Freeze \/ scrub/);
      for (const stage of ["Formation", "Full anatomy", "Release", "Destination", "Presentation mode"]) assert.ok(body.includes(stage), stage);
      for (const viewport of [320, 390, 768, 1440, 1920]) assert.match(body, new RegExp(`<option value="${viewport}"`));
      assert.match(body, /<iframe\b[^>]*title="Actual (?:cover|research|about) portfolio page"[^>]*src="\/(?:research|about)?"/);
      assert.match(body, /No entrance on direct load|Loading actual destination/);
    } else assert.doesNotMatch(body, /class="motion-laboratory"|class="lab-canvas"|data-lab-membrane/);
    console.log(development ? "Development review shell (HTTP, before query hydration)" : "Production exclusion", query, response.status);
}
if (development) {
  const source = await readFile(new URL("../app/motion-lab/MotionLaboratory.tsx", import.meta.url), "utf8");
  assert.match(source, /import LivingStage from "\.\.\/components\/LivingStage"/);
  assert.match(source, /<LivingStage kind=\{kind\} progress=\{progress\}/);
  assert.doesNotMatch(source, /playLabTransition|LabCompositions|labConcepts/);
  console.log("Shared public/laboratory renderer source contract passed");
}
const home = await fetch(base + "/");
assert.equal(home.status, 200);
const html = await home.text();
assert.doesNotMatch(html, /href="\/motion-lab/);
const cv = await stat(new URL("../public/cv.pdf", import.meta.url)).catch(() => null);
if (cv?.isFile() && cv.size > 0) {
  assert.match(html, /href="\/cv\.pdf"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /href="\/cv\.pdf"[^>]*download="Kondwani-Phiri-CV\.pdf"/);
  const pdf = await fetch(base + "/cv.pdf", { method: "HEAD" });
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get("content-type") ?? "", /application\/pdf/);
  assert.equal(Number(pdf.headers.get("content-length")), cv.size);
  console.log("CV in-site viewer/download links and PDF HEAD", pdf.status, cv.size, "bytes");
} else {
  assert.match(html, /CV Â· PDF pending/);
  assert.doesNotMatch(html, /href="\/cv.pdf"/);
  console.log("CV pending state verified");
}
