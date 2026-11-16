"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { studioSessionRequest } from "./session-bridge";
import Feedback from "../components/Feedback";

export default function StudioSession({ openOnConnect = false }: { openOnConnect?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let running = false;
    let queued = false;
    let stopped = false;
    function stop() { stopped = true; }
    function resume() { stopped = false; void connect(); }
    window.addEventListener("studio:signout", stop);
    window.addEventListener("studio:resume", resume);
    async function connect() {
      if (stopped || controller.signal.aborted) return;
      if (running) { queued = true; return; }
      running = true;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (stopped || controller.signal.aborted) return;
        if (error) throw new Error("Could not read your sign-in session. Please retry.");
        if (!data.session) {
          if (!openOnConnect) {
            const response = await studioSessionRequest({ method: "DELETE", signal: controller.signal }, () => !stopped && !controller.signal.aborted);
            if (!response.ok) throw new Error("Could not close your expired Studio session. Retry verification.");
            router.refresh();
          }
          return;
        }
        const response = await studioSessionRequest({
          method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` },
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
        }, () => !stopped && !controller.signal.aborted);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not verify Studio access.");
        if (!controller.signal.aborted && !stopped) {
          setError("");
          if (openOnConnect) router.refresh();
        }
      } catch (error) {
        if (!controller.signal.aborted && !stopped) setError(error instanceof Error ? error.message : "Could not verify Studio access.");
      } finally {
        running = false;
        if (queued && !controller.signal.aborted) { queued = false; void connect(); }
      }
    }
    void connect();
    const interval = setInterval(() => { void connect(); }, 120000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;
      clearTimeout(timer);
      timer = setTimeout(() => { void connect(); }, 0);
    });
    return () => { window.removeEventListener("studio:signout", stop); window.removeEventListener("studio:resume", resume); controller.abort(); clearTimeout(timer); clearInterval(interval); subscription.unsubscribe(); };
  }, [router, openOnConnect, attempt]);
  return error ? <Feedback kind="error" action={<button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry verification</button>}>{error}</Feedback> : null;
}
