"use client";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import FloatingWindow from "./FloatingWindow";
import { clampViewerZoom } from "@/lib/viewer-model";

export default function ImageLightbox({ source, label, children }: { source: string; label: string; children: ReactNode }) {
 const [opened,setOpened]=useState(false);
 const [zoom,setZoom]=useState(1);
 const viewport=useRef<HTMLDivElement>(null);
 const pan=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 return <div className="image-lightbox">
  <a href={source} className="image-lightbox-trigger" aria-label={label} onClick={event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof HTMLDialogElement==="undefined"||typeof HTMLDialogElement.prototype.showModal!=="function")return;
   event.preventDefault();setZoom(1);setOpened(true);
  }}>{children}<span className="image-enlarge">View full size <span aria-hidden="true">&#8599;</span></span></a>
  {opened&&<FloatingWindow title="Image study" subtitle={label} onClose={()=>setOpened(false)} className="media-window" toolbar={<>
   <div className="viewer-tool-group"><button type="button" aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(value=>Math.max(1,clampViewerZoom(value-.25)))}>&minus;</button><output aria-label="Image magnification">{Math.round(zoom*100)}%</output><button type="button" aria-label="Zoom in" disabled={zoom>=4} onClick={()=>setZoom(value=>clampViewerZoom(value+.25))}>+</button><button type="button" onClick={()=>setZoom(1)}>Fit image</button></div>
   <div className="viewer-document-actions"><a href={source} download>Download</a><a href={source} target="_blank" rel="noopener noreferrer">Open original &#8599;</a></div>
  </>}>
   <div ref={viewport} className={`media-viewport ${zoom>1?"media-viewport--zoomed":""}`} tabIndex={0} role="region" aria-label="Image. Scroll or drag to pan when magnified." onPointerDown={event=>{
    if(zoom<=1||event.pointerType!=="mouse"||event.button!==0||!viewport.current)return;
    pan.current={x:event.clientX,y:event.clientY,left:viewport.current.scrollLeft,top:viewport.current.scrollTop};event.currentTarget.setPointerCapture(event.pointerId);
   }} onPointerMove={event=>{if(!pan.current||!viewport.current)return;viewport.current.scrollLeft=pan.current.left-(event.clientX-pan.current.x);viewport.current.scrollTop=pan.current.top-(event.clientY-pan.current.y);}} onPointerUp={()=>{pan.current=null;}} onPointerCancel={()=>{pan.current=null;}}>
    <div className="media-canvas" style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}><Image src={source} alt={label} fill sizes="95vw" unoptimized draggable={false} style={{objectFit:"contain"}} /></div>
   </div><p className="media-caption">{label}</p>
  </FloatingWindow>}
 </div>;
}
