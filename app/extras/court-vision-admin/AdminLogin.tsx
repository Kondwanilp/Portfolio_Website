"use client";

import { useRef, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase/client";
import { requireCourtOwner } from "../../../lib/court-vision-repository";
import Feedback from "../../components/Feedback";

export default function AdminLogin({ sessionError, heading = "Court Vision.", description = "Sign in to manage pickup sessions and basketball videos." }: { sessionError: string; heading?: string; description?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: String(values.get("email")).trim(), password: String(values.get("password")) });
      if (error) throw new Error("Could not sign in. Check your email and password and try again.");
      await requireCourtOwner();
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in. Please retry.");
    } finally { submitting.current = false; setBusy(false); }
  }
  return (
    <section className="cv-admin-login">
      <p className="cv-admin-eyebrow">ADMINISTRATOR ACCESS</p>
      <h1>{heading}</h1>
      <p className="cv-admin-muted">{description}</p>
      <form onSubmit={login} aria-busy={busy}>
        <label>Email<input type="email" name="email" autoComplete="username" required disabled={busy} /></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" required disabled={busy} /></label>
        {(error || sessionError) && <Feedback kind="error">{error || sessionError}</Feedback>}
        <button type="submit" disabled={busy}>{busy ? "Signing in..." : "Log in"}</button>
      </form>
    </section>
  );
}
