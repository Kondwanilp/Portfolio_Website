import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { clampViewerPage,clampViewerZoom,fitViewerScale,mountViewerDialog } from "../lib/viewer-model.ts";

test("PDF navigation and magnification remain bounded for valid and invalid input",()=>{
 assert.equal(clampViewerPage(0,5),1);assert.equal(clampViewerPage(9,5),5);assert.equal(clampViewerPage(2.8,5),2);assert.equal(clampViewerPage(NaN,5),1);assert.equal(clampViewerPage(2,NaN),1);
 assert.equal(clampViewerZoom(-1),.25);assert.equal(clampViewerZoom(9),4);assert.equal(clampViewerZoom(Infinity),1);assert.equal(clampViewerZoom(1.5),1.5);
});
test("fit page fits both dimensions while fit width uses available reading width",()=>{
 const page={width:612,height:792};const area={width:800,height:500};
 assert.equal(fitViewerScale(page,area,"width"),800/612);assert.equal(fitViewerScale(page,area,"page"),500/792);
 for(const width of [272,342,720,1200]) {const scale=fitViewerScale(page,{width,height:650},"page");assert.ok(page.width*scale<=width+.001 && page.height*scale<=650+.001);}
 assert.equal(fitViewerScale({width:0,height:0},area,"width"),1);
});
test("dialog teardown is idempotent and restores its connected opener without scrolling",()=>{
 let shown=0,closed=0,focused=0;
 const dialog={open:false,showModal(){shown++;this.open=true;},close(){closed++;this.open=false;}};
 const cleanup=mountViewerDialog(dialog,{isConnected:true,focus(options){focused++;assert.equal(options.preventScroll,true);}});
 assert.equal(shown,1);assert.equal(dialog.open,true);cleanup();cleanup();assert.equal(closed,1);assert.equal(focused,1);
});
test("Escape/native closure and removed openers do not receive stale close or focus operations",()=>{
 let closed=0,focused=0;const dialog={open:true,showModal(){throw Error("Already open");},close(){closed++;this.open=false;}};
 const cleanup=mountViewerDialog(dialog,{isConnected:false,focus(){focused++;}});dialog.open=false;cleanup();assert.equal(closed,0);assert.equal(focused,0);
});
test("the served PDF worker is identical to its pinned vendor package",async()=>{
 const [manifest,vendor,served]=await Promise.all([readFile(new URL("../package.json",import.meta.url),"utf8"),readFile(new URL("../node_modules/pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url)),readFile(new URL("../public/pdfjs/6.5.438/pdf.worker.min.mjs",import.meta.url))]);
 assert.equal(JSON.parse(manifest).dependencies["pdfjs-dist"],"6.5.438");assert.equal(createHash("sha256").update(served).digest("hex"),createHash("sha256").update(vendor).digest("hex"));
});
