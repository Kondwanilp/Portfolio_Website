// Serialize cookie mutations so an in-flight renewal cannot overwrite sign-out.
let pending: Promise<unknown> = Promise.resolve();
export function studioSessionRequest(init: RequestInit, isActive: () => boolean = () => true) {
  const request = pending.catch(() => undefined).then(() => {
    if (!isActive()) throw new DOMException("Session renewal cancelled", "AbortError");
    return fetch("/api/studio/session", { ...init, signal: init.signal ?? AbortSignal.timeout(12000) });
  });
  pending = request;
  return request;
}
