import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extractSeed, prepareSeedPlan, seedIdentity } from "../scripts/prepare-studio-seed.mjs";
import { parseDraft } from "../lib/studio/content.ts";

const root = fileURLToPath(new URL("../", import.meta.url));

test("moved seed fragments preserve their existing identity while recording the current source", () => {
 const source = '<section id="experience"><p>Original professional experience.</p></section>';
 const moved = extractSeed(source, "app/components/ExperienceTimeline.tsx", "experience", "experience", "Professional experience", "app/page.tsx#experience");
 assert.equal(moved.seedKey,"app/page.tsx#experience");
 assert.equal(moved.entry.id,seedIdentity("app/page.tsx#experience"));
 assert.deepEqual(moved.sourceLocation,{filename:"app/components/ExperienceTimeline.tsx",sectionId:"experience"});
 assert.equal(moved.sourceFragment,source);
 assert.equal(moved.entry.workflow,"draft");
 assert.equal(moved.requiresEditorialReview,true);
});

test("source seed review finds the real research, experience and gallery after the public reset", async () => {
 const plan = await prepareSeedPlan(root,{includeLocalDrafts:false});
 assert.equal(plan.publication,"none");assert.deepEqual(plan.localDrafts,[]);assert.equal(plan.entries.length,5);
 const keys=["app/research/page.tsx#dorsey","app/research/page.tsx#douglas","app/research/page.tsx#yang","app/page.tsx#experience","app/page.tsx#gallery"];
 assert.deepEqual(plan.entries.map((entry:{seedKey:string})=>entry.seedKey),keys);
 for(const entry of plan.entries) {assert.equal(entry.entry.id,seedIdentity(entry.seedKey));assert.equal(entry.entry.workflow,"draft");assert.ok(entry.sourceFragment.includes(`id="${entry.sourceLocation.sectionId}"`) || entry.sourceFragment.includes(`data-research-case="${entry.sourceLocation.sectionId}"`));assert.equal(entry.requiresEditorialReview,true);}
 assert.match(plan.entries[0].entry.body,/pentachlorophenol/);
 assert.match(plan.entries[1].entry.body,/seabirds/);
 assert.match(plan.entries[2].entry.body,/theoretical/);
 assert.match(plan.entries[3].entry.body,/Memorial Sloan/);
 assert.match(plan.entries[4].entry.body,/People, places/);
 assert.equal(plan.entries[3].sourceLocation.filename,"app/components/ExperienceTimeline.tsx");
 assert.equal(plan.entries[4].sourceLocation.filename,"app/components/PortfolioGallery.tsx");
 assert.deepEqual([...plan.entries[4].entry.media].sort(),["asset:research/lab-photos/molecular-toxicology-lab.jpg","asset:research/presentations/las100.jpeg","asset:research/presentations/undergrad_symposium.jpeg"].sort());
 assert.ok(plan.entries[4].unresolvedExpressions.length>0,"Mapped gallery source must remain flagged for editorial review");
});

test("local content validation accepts the real Listening Room channel and rejects invented channels",()=>{
 const entry={id:"a1234567-1234-4123-a123-123456789012",kind:"extras",title:"A listening note",slug:"listening-note",summary:"",body:"",details:{channel:"listening"},media:[],workflow:"draft"};
 assert.equal(parseDraft(entry).details.channel,"listening");
 assert.throws(()=>parseDraft({...entry,details:{channel:"not-a-channel"}}),/existing Extras channel/);
});

test("public V3 layout retains direct document access without mounting the old section curtain",async()=>{
 const [layout,viewer,window] = await Promise.all([readFile(new URL("../app/layout.tsx",import.meta.url),"utf8"),readFile(new URL("../app/components/CVLinks.tsx",import.meta.url),"utf8"),readFile(new URL("../app/components/FloatingWindow.tsx",import.meta.url),"utf8")]);
 assert.doesNotMatch(layout,/<LivingTransitions\b|import LivingTransitions/);
 assert.match(viewer,/href="\/cv.pdf"/);assert.match(viewer,/aria-haspopup="dialog"/);assert.match(viewer,/download="Kondwani-Phiri-CV.pdf"/);
 assert.match(window,/<dialog/);assert.match(window,/aria-labelledby/);assert.match(window,/onCancel/);assert.match(window,/mountViewerDialog/);
});
