"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const destinations: Record<string, string> = { "#about": "/about", "#leadership": "/leadership", "#extras": "/extras" };

/** Preserve shared legacy bookmarks while the cover stays short. */
export default function LegacySectionRedirect() {
  const router = useRouter();
  useEffect(() => {
    const follow = () => { const destination = destinations[window.location.hash]; if (destination) router.replace(destination); };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [router]);
  return null;
}
