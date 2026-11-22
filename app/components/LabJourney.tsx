"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode, type CSSProperties } from "react";

type Direction = "enter" | "return";
type Point = { x: number; y: number };
type Trip = { href: string; direction: Direction; origin: Point; phase: "cover" | "reveal" };
type JourneyContext = { navigate: (href: string, direction?: Direction, origin?: Point) => void };
const Context = createContext<JourneyContext | null>(null);

export function useLabJourney() {
  const value = useContext(Context);
  if (!value) throw new Error("LabJourneyProvider must wrap lab navigation.");
  return value;
}

/** Kept above the route tree so the optical transition survives navigation. */
export function LabJourneyProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [trip, setTrip] = useState<Trip | null>(null);
  const pending = useRef<Trip | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const navigate = useCallback((href: string, direction: Direction = "enter", origin?: Point) => {
    if (typeof window === "undefined" || href === pathname || pending.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    const next: Trip = {
      href,
      direction,
      origin: origin ?? { x: window.innerWidth * 0.76, y: window.innerHeight * 0.46 },
      phase: "cover",
    };
    pending.current = next;
    setTrip(next);
    clearTimers();
    timers.current.push(setTimeout(() => router.push(href), direction === "return" ? 350 : 480));
    // A failed or slow route must not trap anyone behind the optical field.
    timers.current.push(setTimeout(() => {
      pending.current = null;
      setTrip(null);
    }, 4000));
  }, [clearTimers, pathname, router]);

  useEffect(() => {
    if (!pending.current || pathname !== pending.current.href) return;
    const frame = window.requestAnimationFrame(() => {
      setTrip(current => current ? { ...current, phase: "reveal" } : null);
    });
    timers.current.push(setTimeout(() => {
      pending.current = null;
      setTrip(null);
      clearTimers();
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }, 550));
    return () => window.cancelAnimationFrame(frame);
  }, [clearTimers, pathname]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <Context.Provider value={{ navigate }}>
      {children}
      {trip && (
        <div
          className={`lab-route-iris lab-route-iris--${trip.direction} lab-route-iris--${trip.phase}`}
          style={{ "--iris-x": `${trip.origin.x}px`, "--iris-y": `${trip.origin.y}px` } as CSSProperties}
          aria-hidden="true"
        >
          <span className="lab-route-iris__field">
            <span className="lab-route-iris__cell lab-route-iris__cell--one" />
            <span className="lab-route-iris__cell lab-route-iris__cell--two" />
            <span className="lab-route-iris__cell lab-route-iris__cell--three" />
          </span>
        </div>
      )}
    </Context.Provider>
  );
}

/** A normal internal link with a brief optical return to the bench. */
export function LabReturnLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { navigate } = useLabJourney();
  const pathname = usePathname();
  return (
    <Link
      {...props}
      onClick={event => {
        onClick?.(event);
        if (event.defaultPrevented || pathname === "/" || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.currentTarget.target === "_blank") return;
        event.preventDefault();
        navigate("/", "return");
      }}
    />
  );
}
