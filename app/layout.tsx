
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./foundations.css";
import "./living-matter.css";
import "./exhibition-scenes.css";
import "./os-interface.css";
import "./viewers.css";
import LivingTransitions from "./components/LivingTransitions";

const editorial = localFont({ src: [{ path: "./fonts/eb-garamond-normal-400-700.woff2", weight: "400 700", style: "normal" }, { path: "./fonts/eb-garamond-italic-400-700.woff2", weight: "400 700", style: "italic" }], variable: "--font-editorial-local", display: "swap" });
const sans = localFont({ src: "./fonts/instrument-sans-normal-400-700.woff2", weight: "400 700", variable: "--font-sans-local", display: "swap" });
const mono = localFont({ src: [{ path: "./fonts/courier-prime-normal-400.woff2", weight: "400" }, { path: "./fonts/courier-prime-normal-700.woff2", weight: "700" }], variable: "--font-mono-local", display: "swap", preload: false });
const hand = localFont({ src: "./fonts/alex-brush-normal-400.woff2", weight: "400", variable: "--font-hand-local", display: "swap", preload: false });

export const metadata: Metadata = {
  title: {
    default: "Kondwani Phiri | Biology, Technology, & Everything Else",
    template: "%s | Kondwani Phiri",
  },
  description:
    "The personal portfolio of Kondwani Phiri. Exploring biology, technology, research, and everything in between.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${editorial.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <LivingTransitions />
      </body>
    </html>
  );
}
