/** Bound provider work while retaining cancellation supplied by the SDK/caller. */
export function boundedFetch(timeoutMs: number, transport: typeof fetch = fetch): typeof fetch {
  return (input, init) => {
    const incoming = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    const deadline = AbortSignal.timeout(timeoutMs);
    const signal = incoming ? AbortSignal.any([incoming, deadline]) : deadline;
    return transport(input, { ...init, signal, cache: "no-store" });
  };
}
