
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kondwani Phiri | Personal Portfolio",
    template: "%s | Kondwani Phiri",
  },
  description:
    "The personal portfolio of Kondwani Phiri. Exploring biology, technology, research, and everything in between.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
