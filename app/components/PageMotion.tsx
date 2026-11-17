"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/studio") || pathname.startsWith("/motion-lab") || !window.IntersectionObserver || !Element.prototype.animate) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const cancel = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || document.hidden) continue;
        const animation = entry.target.animate([
          { opacity: .5, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 500, easing: "cubic-bezier(.22,1,.36,1)" });
        animations.add(animation);
        void animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      }
    }, { threshold: .12 });
    document.querySelectorAll("main > header:not(.v3-toolbar), .v3-identity-panel, .v3-notebook-row, .home-afterhours, .mood-card, .mood-game, .experience-card, .leadership-item").forEach(element => observer.observe(element));
    preference.addEventListener("change", cancel);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", cancel);
      animations.forEach(animation => animation.cancel());
    };
  }, [pathname]);

  return null;
}
