import assert from "node:assert/strict";
import test from "node:test";
import { advanceSectionVisit, type SectionVisit } from "../lib/living-viewport.ts";

test("stationary meaningful entry waits 80ms at small, mobile, tablet and desktop viewport heights", () => {
  for (const height of [32, 320, 390, 768, 1440]) {
    const initial = Object.freeze({ inside: false, entered: 0 });
    const bounds = { top: 0, bottom: height * .8 };
    const start = advanceSectionVisit(initial, bounds, height, 100);
    assert.equal(start.action, "wait");
    assert.equal(start.state.inside, false);
    const early = advanceSectionVisit(start.state, bounds, height, 179);
    assert.equal(early.action, "wait");
    const entered = advanceSectionVisit(early.state, bounds, height, 180);
    assert.equal(entered.action, "enter");
    assert.equal(entered.state.inside, true);
    assert.equal(advanceSectionVisit(entered.state, bounds, height, 200).action, "none");
    assert.deepEqual(initial, { inside: false, entered: 0 });
  }
  let state: SectionVisit = { inside: false, entered: 0 };
  state = advanceSectionVisit(state, { top: 0, bottom: 400 }, 500, 0).state;
  assert.equal(advanceSectionVisit(state, { top: 0, bottom: 400 }, 500, 80).action, "enter", "A clock beginning at zero must retain its initial entry");
});

test("entry requires continuous meaningful visibility and rearms its timer after partial exposure", () => {
  const height = 800;
  const meaningful = { top: 120, bottom: 600 };
  let result = advanceSectionVisit({ inside: false, entered: 0 }, meaningful, height, 100);
  result = advanceSectionVisit(result.state, { top: 720, bottom: 1000 }, height, 140);
  assert.equal(result.action, "none");
  assert.deepEqual(result.state, { inside: false, entered: 0 });
  result = advanceSectionVisit(result.state, meaningful, height, 170);
  assert.equal(advanceSectionVisit(result.state, meaningful, height, 180).action, "wait", "Discontinuous exposure must not accumulate into an entrance");
  assert.equal(advanceSectionVisit(result.state, meaningful, height, 250).action, "enter");
});

test("an active visit survives partial visibility without resetting or repeating its animation", () => {
  const inside = Object.freeze({ inside: true, entered: 100 });
  for (const bounds of [{ top: 790, bottom: 1200 }, { top: -500, bottom: 1 }, { top: -100, bottom: 900 }]) {
    const result = advanceSectionVisit(inside, bounds, 800, 600);
    assert.equal(result.action, "none");
    assert.equal(result.state.inside, true);
    assert.equal(result.state.entered, 100);
  }
});

test("only full exit completes the visit, and meaningful reentry can replay it", () => {
  for (const bounds of [{ top: -600, bottom: 0 }, { top: 800, bottom: 1400 }]) {
    let result = advanceSectionVisit({ inside: true, entered: 100 }, bounds, 800, 500);
    assert.equal(result.action, "exit");
    assert.deepEqual(result.state, { inside: false, entered: 0 });
    result = advanceSectionVisit(result.state, bounds, 800, 516);
    assert.equal(result.action, "none", "Remaining outside must not repeatedly complete a scene");
    result = advanceSectionVisit(result.state, { top: 0, bottom: 600 }, 800, 600);
    assert.equal(result.action, "wait");
    result = advanceSectionVisit(result.state, { top: 0, bottom: 600 }, 800, 680);
    assert.equal(result.action, "enter");
  }
});

test("near-boundary movement cannot cycle entrances and exits", () => {
  let state: SectionVisit = { inside: false, entered: 0 };
  for (let time = 100; time <= 500; time += 16) {
    const result = advanceSectionVisit(state, { top: time % 32 ? 700 : 790, bottom: 1200 }, 800, time);
    assert.equal(result.action, "none"); state = result.state;
  }
  state = { inside: true, entered: 100 };
  for (let time = 600; time <= 1000; time += 16) {
    const result = advanceSectionVisit(state, { top: time % 32 ? 700 : 790, bottom: 1200 }, 800, time);
    assert.equal(result.action, "none"); assert.equal(result.state.inside, true); state = result.state;
  }
});

test("a rapidly passed section never starts an entrance or blocks navigation", () => {
  let result = advanceSectionVisit({ inside: false, entered: 0 }, { top: 100, bottom: 500 }, 800, 100);
  assert.equal(result.action, "wait");
  result = advanceSectionVisit(result.state, { top: -600, bottom: -1 }, 800, 116);
  assert.equal(result.action, "none");
  assert.deepEqual(result.state, { inside: false, entered: 0 });
  result = advanceSectionVisit(result.state, { top: -700, bottom: -101 }, 800, 200);
  assert.equal(result.action, "none");
});
