import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3101";
const baseline = JSON.parse(await readFile(new URL("../tests/fixtures/editorial-content.json", import.meta.url), "utf8"));
const readable = value => value.replace(/&amp;/g, "&").replace(/&(?:apos|#x27|#39);/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const home = baseline["app/page.tsx"];
const preservation = { "/": [home[0],home[17]], "/about": home.slice(1,6), "/experience": home.slice(6,11), "/leadership": home.slice(11,14), "/extras": home.slice(14,17), "/research": baseline["app/research/page.tsx"], "/gallery": [], "/journal": [], "/extras/listening": [], "/extras/chess": [], "/extras/basketball": [] };
let passages = 0;
for (const [route, expected] of Object.entries(preservation)) {
 const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
 assert.equal(response.status,200,route);
 const html = await response.text();
 const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
 const text = readable(body.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g," "));
 assert.ok(/<title>[^<]*Kondwani Phiri[^<]*<\/title>/.test(html),route+" title");
 assert.ok(body.includes('aria-label="Main navigation"'),route+" navigation");
 assert.ok(body.includes('class="editorial-mobile-menu"'),route+" mobile menu");
 assert.ok(!body.includes('Skip animation') && !body.includes('Freeze / scrub'),route+" public animation controls");
 assert.ok(!/<dialog\b[^>]*\sopen(?:\s|[=>])/.test(body),route+" unexpected open dialog");
 assert.ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),route+" external fonts");
 for(const passage of expected) { assert.ok(text.includes(readable(passage)),route+" lost original passage "+readable(passage).slice(0,70)); passages++; }
 for(const href of ["/about","/research","/experience","/leadership","/journal","/extras"]) assert.ok(body.includes(`href="${href}"`),route+" missing "+href);
 if(route==="/") {
  assert.ok(body.includes('class="cover-portrait"'),"Real portrait");
  assert.ok(body.includes('aria-label="Explore the exhibition"'),"Editorial directory");
  assert.ok(body.includes('aria-haspopup="dialog"'),"In-site resume entry");
  assert.ok(body.includes('download="Kondwani-Phiri-CV.pdf"'),"PDF download");
  assert.ok(!body.includes('class="about-copy"') && !body.includes('class="experience-grid"'),"Homepage must stay short");
 }
 if(route==="/research") {
  for(const asset of ["molecular-toxicology-lab.","molecular-toxicology-lab2.","undergrad_symposium.","las100.","2025undergraduate_symposium_poster.","las100_poster.","quantum_dot_solarcell_poster."]) assert.ok(body.includes(asset),"Original research image "+asset);
  assert.equal((body.match(/class="research-methods"/g)??[]).length,4,"Original method disclosures");
  assert.ok(body.includes('aria-label="Research method connections"'));
  assert.ok(text.includes("theoretical model suggesting a 2% improvement"));
 }
 if(["/research","/about","/experience","/leadership","/journal","/extras/listening","/extras/chess","/extras/basketball"].includes(route)) assert.ok(body.includes('data-living-destination='),route+" public motion integration");
 console.log("Editorial server HTML",route,"passed");
}
assert.equal(passages,35,"Every original substantive passage must remain public");
console.log("Original substantive passages preserved across dedicated destinations",passages);
