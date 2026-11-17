import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3101";
const baseline = JSON.parse(await readFile(new URL("../tests/fixtures/editorial-content.json", import.meta.url), "utf8"));
const readable = value => value.replace(/&amp;/g, "&").replace(/&(?:apos|#x27|#39);/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const home = baseline["app/page.tsx"];
const preservation = { "/": ["Take a closer look."], "/about": home.slice(0,5), "/leadership": home.filter(passage => /Founded and lead|Support residential|Mentor Zambian/.test(passage)), "/extras": ["Comic-Omics", "Places I’ve been."], "/research": baseline["app/research/page.tsx"] };
let passages = 0;
for (const [route, expected] of Object.entries(preservation)) {
 const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
 assert.equal(response.status,200,route);
 const html = await response.text();
 const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
 const text = readable(body.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g," "));
 assert.ok(/<title>[^<]*Kondwani Phiri[^<]*<\/title>/.test(html),route+" title");
 assert.ok(body.includes('aria-label="Main navigation"'),route+" navigation");
 assert.ok(body.includes('v3-sidebar') && body.includes('v3-mobile-direct-nav'),route+" responsive source-list navigation");
 assert.ok(body.includes('v3-toolbar-home'),route+" permanent Home link");
 assert.ok(!body.includes('Browse collections'),route+" removed Collections dropdown");
 assert.ok(!body.includes('Skip animation') && !body.includes('Freeze / scrub'),route+" public animation controls");
 assert.ok(!/<dialog\b[^>]*\sopen(?:\s|[=>])/.test(body),route+" unexpected open dialog");
 assert.ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),route+" external fonts");
 for(const passage of expected) { assert.ok(text.includes(readable(passage)),route+" lost original passage "+readable(passage).slice(0,70)); passages++; }
 for(const href of ["/about","/research","/leadership","/extras"]) assert.ok(body.includes(`href="${href}"`),route+" missing "+href);
 if(route==="/") {
  assert.ok(!body.includes('alt="Kondwani Phiri"'),"Homepage portrait removed");
  assert.ok(body.includes('lab-exhibition'),"Fieldwork welcome workspace");
  assert.ok(body.includes('aria-haspopup="dialog"'),"In-site resume entry");
  assert.ok(!body.includes('download="Kondwani-Phiri-CV.pdf"'),"Download belongs inside the resume window");
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
for (const route of ["/experience", "/gallery", "/journal"]) {
 const response = await fetch(base + route);
 assert.equal(response.status, 404, route + " retired public page");
}
assert.equal(passages, Object.values(preservation).flat().length);
console.log("Content preservation and approved copy revisions across public destinations",passages);
for (const [channel, anchor] of [["listening","listening"],["chess","chess"],["basketball","basketball"],["wordplay","comics"],["archives","interests"]]) {
 const response = await fetch(`${base}/extras/${channel}`, { redirect:"manual", signal:AbortSignal.timeout(30000) });
 const html = await response.text();
 const target = `/extras#${anchor}`;
 assert.ok(response.headers.get("location")?.endsWith(target) || html.includes(`url=${target}`), channel+" legacy destination must redirect to unified Extras");
 console.log("Unified Extras legacy link",channel,"passed");
}
