import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3101";
const baseline = JSON.parse(await readFile(new URL("../tests/fixtures/editorial-content.json", import.meta.url), "utf8"));
const readable = value => value.replace(/&amp;/g, "&").replace(/&(?:apos|#x27|#39);/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const home = baseline["app/page.tsx"];
const preservation = { "/": [home[0],home[17]], "/about": home.slice(1,6), "/experience": home.slice(6,11), "/leadership": home.slice(11,14), "/extras": home.slice(14,17), "/research": baseline["app/research/page.tsx"], "/gallery": [], "/journal": [] };
let passages = 0;
for (const [route, expected] of Object.entries(preservation)) {
 const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
 assert.equal(response.status,200,route);
 const html = await response.text();
 const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
 const text = readable(body.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g," "));
 assert.ok(/<title>[^<]*Kondwani Phiri[^<]*<\/title>/.test(html),route+" title");
 assert.ok(body.includes('aria-label="Main navigation"'),route+" navigation");
 assert.ok(body.includes('v3-sidebar') && body.includes('v3-mobile-collections'),route+" responsive source-list navigation");
 assert.ok(!body.includes('Skip animation') && !body.includes('Freeze / scrub'),route+" public animation controls");
 assert.ok(!/<dialog\b[^>]*\sopen(?:\s|[=>])/.test(body),route+" unexpected open dialog");
 assert.ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),route+" external fonts");
 for(const passage of expected) { assert.ok(text.includes(readable(passage)),route+" lost original passage "+readable(passage).slice(0,70)); passages++; }
 for(const href of ["/about","/research","/experience","/leadership","/gallery","/journal","/extras"]) assert.ok(body.includes(`href="${href}"`),route+" missing "+href);
 if(route==="/") {
  assert.ok(body.includes('alt="Kondwani Phiri"'),"Real portrait");
  assert.ok(body.includes('v3-workspace'),"Fieldwork welcome workspace");
  assert.ok(body.includes('aria-haspopup="dialog"'),"In-site resume entry");
  assert.ok(body.includes('download="Kondwani-Phiri-CV.pdf"'),"PDF download");
  assert.ok(!body.includes('class="about-copy"') && !body.includes('class="experience-grid"'),"Homepage must stay short");
 }
 if(route==="/research") {
  for(const asset of ["molecular-toxicology-lab.","molecular-toxicology-lab2.","undergrad_symposium.","las100.","2025undergraduate_symposium_poster.","las100_poster.","quantum_dot_solarcell_poster."]) assert.ok(body.includes(asset),"Original research image "+asset);
  assert.equal((body.match(/class="research-methods"/g)??[]).length,4,"Original method disclosures");
  assert.ok(body.includes('aria-label="Research case files"'),"Accessible research file navigation");
  assert.ok(body.includes('aria-labelledby="technique-label"'),"Accessible technique connection controls");
  assert.ok(text.includes("theoretical model suggesting a 2% improvement"));
 }
 assert.ok(!/class="living-transition(?:\s|"|$)/.test(body),route+" forced section cinema must stay unmounted");
 console.log("Editorial server HTML",route,"passed");
}
assert.equal(passages,35,"Every original substantive passage must remain public");
console.log("Content preservation and approved copy revisions across public destinations",passages);
for (const [channel, anchor] of [["listening","listening"],["chess","chess"],["basketball","basketball"],["wordplay","comics"],["archives","interests"]]) {
 const response = await fetch(`${base}/extras/${channel}`, { redirect:"manual", signal:AbortSignal.timeout(30000) });
 const html = await response.text();
 const target = `/extras#${anchor}`;
 assert.ok(response.headers.get("location")?.endsWith(target) || html.includes(`url=${target}`), channel+" legacy destination must redirect to unified Extras");
 console.log("Unified Extras legacy link",channel,"passed");
}
