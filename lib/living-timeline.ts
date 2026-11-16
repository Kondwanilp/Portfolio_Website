export type TimelineClock = { request: (callback: (time: number) => void) => number; cancel: (id: number) => void };
export const MAX_PLAYBACK_RATE = 4;

/** Finite, cancellable clock shared by the website and its motion laboratory. */
export function runLivingTimeline(onFrame: (progress: number) => void, onFinish: () => void, duration = 2500, clock: TimelineClock = { request: requestAnimationFrame, cancel: cancelAnimationFrame }) {
  const finiteDuration = Number.isFinite(duration) && duration > 0 ? duration : 2500;
  let id = 0;
  let previous: number | null = null;
  let elapsed = 0;
  let stopped = false;
  let velocity = 0;
  let rate = 1;
  let lastScroll: number | null = null;
  let draining: { progress: number; elapsed: number } | null = null;
  function cancel() { if (stopped) return; stopped = true; clock.cancel(id); }
  function finish() { if (stopped) return; cancel(); onFinish(); }
  function addScroll(deltaPx: number, timeMs = performance.now()) {
    if (stopped || !Number.isFinite(deltaPx) || !Number.isFinite(timeMs)) return;
    const deltaTime = lastScroll === null ? 16.7 : Math.max(8, timeMs - lastScroll);
    lastScroll = timeMs;
    const sample = Math.min(8, Math.abs(deltaPx) / deltaTime);
    velocity = velocity * .35 + sample * .65;
  }
  function complete() { if (!stopped && !draining) draining = { progress: Math.min(1, elapsed / finiteDuration), elapsed: 0 }; }
  function tick(time: number) {
    if (stopped) return;
    const delta = previous === null ? 0 : Math.max(0, Math.min(time - previous, 100));
    previous = time;
    // Velocity decays continuously; playback rate eases toward it without touching progress.
    velocity *= Math.exp(-delta / 180);
    const targetRate = 1 + Math.min(MAX_PLAYBACK_RATE - 1, velocity * 1.4);
    rate += (targetRate - rate) * (1 - Math.exp(-delta / 140));
    elapsed += delta * rate;
    let progress = Math.min(1, elapsed / finiteDuration);
    if (draining) {
      draining.elapsed += delta;
      const t = Math.min(1, draining.elapsed / 220);
      progress = draining.progress + (1 - draining.progress) * t * t * (3 - 2 * t);
    }
    try { onFrame(progress); } catch { finish(); return; }
    if (progress >= 1) finish();
    else id = clock.request(tick);
  }
  id = clock.request(tick);
  return { cancel, finish, complete, addScroll, getPlaybackRate: () => rate };
}
