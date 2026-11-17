import assert from "node:assert/strict";
import test from "node:test";
import { collectionForPath,publicCollections } from "../lib/public-navigation.ts";
import { researchFileFromHash,relatedResearchFiles,adjacentResearchFile,RESEARCH_FILES,RESEARCH_TECHNIQUES } from "../app/components/research-notebook-model.ts";

test("the workspace exposes unique real collections and keeps private/development routes out of navigation",()=>{
 const hrefs=publicCollections.map(item=>item.href);assert.equal(new Set(hrefs).size,hrefs.length);
 for(const path of ["/","/about","/research","/experience","/leadership","/gallery","/journal","/extras"]) assert.ok(hrefs.includes(path as typeof hrefs[number]));
 assert.equal(publicCollections.filter(item=>item.group==="off-duty").length,1);
 assert.ok(hrefs.every(href=>!href.startsWith("/studio")&&!href.startsWith("/motion-lab")&&!href.includes("#")));
 for(const collection of publicCollections)assert.equal(collectionForPath(collection.href).label,collection.label);
 assert.equal(collectionForPath("/journal/notes/a-real-note").label,"Journal");
 assert.equal(collectionForPath("/extras/wordplay").group,"off-duty");
});
test("research case hashes preserve selection across URL roundtrips and reject unknown file IDs",()=>{
 for(const file of RESEARCH_FILES){const url=new URL("https://fieldwork.example/research#"+file.id);assert.equal(researchFileFromHash(url.hash),file.id);}
 for(const value of ["","#unknown","#<script>","#DORSEY"]) assert.equal(researchFileFromHash(value),"dorsey");
});
test("research source-list keyboard traversal wraps without losing valid selection",()=>{
 assert.equal(adjacentResearchFile("dorsey","ArrowUp"),"yang");assert.equal(adjacentResearchFile("yang","ArrowDown"),"dorsey");
 assert.equal(adjacentResearchFile("douglas","Home"),"dorsey");assert.equal(adjacentResearchFile("douglas","End"),"yang");assert.equal(adjacentResearchFile("douglas","Tab"),"douglas");
});
test("techniques trace only documented case associations and clearing the filter restores the collection",()=>{
 assert.deepEqual(relatedResearchFiles("analysis"),["douglas","yang"]);assert.deepEqual(relatedResearchFiles("culture"),["dorsey"]);assert.deepEqual(relatedResearchFiles("elisa"),["douglas"]);
 assert.deepEqual(relatedResearchFiles(null),RESEARCH_FILES.map(file=>file.id));assert.deepEqual(relatedResearchFiles("unknown"),RESEARCH_FILES.map(file=>file.id));
 for(const technique of RESEARCH_TECHNIQUES){const related=relatedResearchFiles(technique.id);assert.ok(related.length>0);assert.ok(related.every(id=>RESEARCH_FILES.some(file=>file.id===id)));}
});
