"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { COURT_OWNER_ID } from "../../../lib/court-vision-repository";

export function useCourtAuth() {
  const [auth, setAuth] = useState({ checking: true, ownerId: "", today: "", error: "" });
  useEffect(() => {
    let mounted = true;
    let version = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function verify() {
      const current = ++version;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted || current !== version) return;
        const date = new Date();
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        setAuth({
          checking: false,
          ownerId: !error && data.user?.id === COURT_OWNER_ID ? data.user.id : "",
          today,
          error: data.user && data.user.id !== COURT_OWNER_ID ? "This account is not authorized to manage Court Vision." : "",
        });
      } catch {
        if (mounted && current === version) setAuth({ checking: false, ownerId: "", today: "", error: "Could not verify your session. Please sign in again." });
      }
    }
    void verify();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;
      if (event === "SIGNED_OUT") {
        version++;
        if (mounted) setAuth({ checking: false, ownerId: "", today: "", error: "" });
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => { void verify(); }, 0);
    });
    return () => { mounted = false; version++; clearTimeout(timer); subscription.unsubscribe(); };
  }, []);
  return auth;
}
