"use client";
import { Component, type ReactNode } from "react";
import FloatingWindow from "./FloatingWindow";

/** A failed lazy chunk must not take away access to the original public document. */
export default class ResumeLoadBoundary extends Component<{ children: ReactNode; onClose: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <FloatingWindow title="Document viewer" onClose={this.props.onClose}>
      <div className="viewer-fallback"><h2>Open the original document.</h2><p>The viewer could not load. The original PDF remains available.</p><a href="/cv.pdf" target="_blank" rel="noopener noreferrer">View PDF in a new tab</a><a href="/cv.pdf" download="Kondwani-Phiri-CV.pdf">Download PDF</a></div>
    </FloatingWindow>;
  }
}
