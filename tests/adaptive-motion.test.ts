import assert from "node:assert/strict";
import test from "node:test";
import { runLivingTimeline, type TimelineClock } from "../lib/living-timeline.ts";

function manualClock() {
  let nextId = 0;
  let now = 0;
  const callbacks = new Map<number, (time: number) => void>();
  const clock: TimelineClock = {
    request(callback) { const id = ++nextId; callbacks.set(id, callback); return id; },
    cancel(id) { callbacks.delete(id); },
  };
  return {
    clock, callbacks,
    get now() { return now; },
    frame(time: number) {
      now = time;
      const pending = [...callbacks.values()]; callbacks.clear();
      pending.forEach(callback => callback(time));
    },
  };
}

function fixture(duration = 12000) {
  const clock = manualClock();
  const frames: number[] = [];
  let completed = 0;
  const timeline = runLivingTimeline(progress => frames.push(progress), () => completed++, duration, clock.clock);
  clock.frame(0);
  return { ...clock, clock, frames, timeline, get completed() { return completed; } };
}

function scrollFor(state: ReturnType<typeof fixture>, delta: number, start: number, end: number) {
  for (let time = start; time <= end; time += 16) {
    state.timeline.addScroll(delta, time);
    state.clock.frame(time);
  }
}

test("without scroll input, the animation continues autonomously at its baseline speed", () => {
  const state = fixture(2500);
  for (let time = 16; time <= 1280; time += 16) state.clock.frame(time);
  assert.ok(state.frames.at(-1)! > .45 && state.frames.at(-1)! < .6);
  assert.equal(state.timeline.getPlaybackRate(), 1);
  assert.equal(state.completed, 0);
  for (let time = 1296; time <= 2608; time += 16) state.clock.frame(time);
  assert.equal(state.frames.at(-1), 1);
  assert.equal(state.completed, 1);
  assert.equal(state.clock.callbacks.size, 0);
});

test("sustained fast scrolling accelerates more than gentle scrolling without exceeding the cap", () => {
  const gentle = fixture(); const fast = fixture();
  try {
    scrollFor(gentle, 3, 16, 480);
    scrollFor(fast, 100, 16, 480);
    assert.ok(gentle.timeline.getPlaybackRate() > 1, "Even gentle movement should influence the shared playback rate");
    assert.ok(fast.timeline.getPlaybackRate() > gentle.timeline.getPlaybackRate() + .5);
    assert.ok(fast.timeline.getPlaybackRate() <= 5);
    assert.ok(fast.frames.at(-1)! > gentle.frames.at(-1)!);
  } finally { gentle.timeline.cancel(); fast.timeline.cancel(); }
});

test("scroll input changes speed through easing while preserving current animation progress", () => {
  const state = fixture();
  try {
    for (let time = 16; time <= 160; time += 16) state.clock.frame(time);
    const before = state.frames.at(-1)!;
    const count = state.frames.length;
    state.timeline.addScroll(100, 176);
    assert.equal(state.frames.length, count, "Scroll handling must not restart or seek the renderer");
    assert.equal(state.frames.at(-1), before);
    state.clock.frame(176);
    const rate = state.timeline.getPlaybackRate();
    assert.ok(rate > 1 && rate < 5, "The first accelerated frame should ease toward the target rather than jump to the cap");
    const after = state.frames.at(-1)!;
    assert.ok(after > before && after - before <= 16 * 5 / 12000);
    scrollFor(state, 100, 192, 640);
    state.timeline.addScroll(-100, 656);
    state.clock.frame(656);
    assert.ok(state.frames.every((progress, index) => index === 0 || progress >= state.frames[index - 1]), "Direction changes may accelerate, but must never reverse or reset biological choreography");
  } finally { state.timeline.cancel(); }
});

test("playback smoothly recovers to baseline after scrolling stops and keeps progressing", () => {
  const state = fixture();
  try {
    scrollFor(state, 100, 16, 480);
    const boosted = state.timeline.getPlaybackRate();
    const beforeIdle = state.frames.at(-1)!;
    assert.ok(boosted > 2);
    state.clock.frame(496);
    assert.ok(state.timeline.getPlaybackRate() > 1, "The rate must not snap to baseline on the first idle frame");
    for (let time = 512; time <= 2400; time += 16) state.clock.frame(time);
    assert.ok(state.timeline.getPlaybackRate() >= 1 && state.timeline.getPlaybackRate() < 1.03);
    assert.ok(state.frames.at(-1)! > beforeIdle, "Idle recovery must continue autonomous motion");
  } finally { state.timeline.cancel(); }
});

test("equal positive and negative touch/scroll movement produce the same bounded speed", () => {
  const forward = fixture(); const backward = fixture();
  try {
    scrollFor(forward, 28, 16, 640);
    scrollFor(backward, -28, 16, 640);
    assert.ok(Math.abs(forward.timeline.getPlaybackRate() - backward.timeline.getPlaybackRate()) < 1e-10);
    assert.equal(forward.frames.at(-1), backward.frames.at(-1));
    for (const state of [forward, backward]) {
      state.timeline.addScroll(Number.MAX_VALUE, 656); state.clock.frame(656);
      assert.ok(Number.isFinite(state.timeline.getPlaybackRate()) && state.timeline.getPlaybackRate() >= 1 && state.timeline.getPlaybackRate() <= 5);
    }
  } finally { forward.timeline.cancel(); backward.timeline.cancel(); }
});

test("continuous scrolling reaches the same final pose sooner without duplicate completion", () => {
  const state = fixture(2500);
  let time = 16;
  while (!state.completed && time < 3000) {
    state.timeline.addScroll(100, time); state.clock.frame(time); time += 16;
  }
  assert.equal(state.frames.at(-1), 1);
  assert.equal(state.completed, 1);
  assert.ok(time > 400 && time < 2500, "Acceleration should shorten the sequence while retaining finite pacing");
  state.timeline.finish(); state.timeline.cancel();
  assert.equal(state.completed, 1);
  assert.equal(state.clock.callbacks.size, 0);
});

test("cancelled adaptive playback ignores later scroll input and stale queued frames", () => {
  const state = fixture();
  scrollFor(state, 80, 16, 160);
  const staleFrame = [...state.clock.callbacks.values()][0];
  const before = [...state.frames];
  state.timeline.cancel();
  state.timeline.addScroll(100, 176);
  staleFrame(176);
  state.timeline.finish();
  assert.deepEqual(state.frames, before);
  assert.equal(state.completed, 0);
  assert.equal(state.clock.callbacks.size, 0);
});

test("a full section exit drains the remaining choreography smoothly and repeated exit signals do not restart it", () => {
  const state = fixture();
  scrollFor(state, 12, 16, 160);
  const beforeExit = state.frames.at(-1)!;
  const count = state.frames.length;
  state.timeline.complete();
  assert.equal(state.frames.length, count, "Completing a section must not synchronously snap or reset the scene");
  state.clock.frame(176);
  assert.ok(state.frames.at(-1)! > beforeExit && state.frames.at(-1)! < 1);
  for (let time = 192; time <= 416; time += 16) {
    state.timeline.complete();
    state.timeline.addScroll(-40, time);
    state.clock.frame(time);
  }
  assert.equal(state.frames.at(-1), 1);
  assert.equal(state.completed, 1);
  assert.equal(state.clock.callbacks.size, 0);
  assert.ok(state.frames.every((progress, index) => index === 0 || progress >= state.frames[index - 1]));
});

test("navigation cancellation during an exit drain cannot complete an obsolete section", () => {
  const state = fixture();
  scrollFor(state, 30, 16, 160);
  state.timeline.complete(); state.clock.frame(176);
  const staleFrame = [...state.clock.callbacks.values()][0];
  const before = [...state.frames];
  state.timeline.cancel();
  staleFrame(192); state.timeline.complete();
  assert.deepEqual(state.frames, before);
  assert.equal(state.completed, 0);
  assert.equal(state.clock.callbacks.size, 0);
});
