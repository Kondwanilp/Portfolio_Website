"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export async function studioRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const signal = init?.signal;
  const response = await fetch(url, { ...init, cache: "no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "The Studio could not complete this request.");
  return result as T;
}

export function useStudioData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const active = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    return studioRequest<T>(url, { signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) { setData(value); setError(""); }
    }).catch((error) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Could not load this workspace.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [url]);
  useEffect(() => { void load(); return () => active.current?.abort(); }, [load]);
  return { data, error, loading, reload: load };
}
