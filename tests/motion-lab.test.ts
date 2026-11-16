import assert from "node:assert/strict";
import test from "node:test";
import { isMotionLabEnabled, readLabView } from "../lib/motion-lab.ts";

test("the shared-renderer review laboratory is available only in development", () => {
  assert.equal(isMotionLabEnabled("development"), true);
  for (const environment of [undefined, "production", "test", "preview", ""]) assert.equal(isMotionLabEnabled(environment), false);
});
test("review URLs preserve real destinations and reject unknown views", () => {
  for (const view of ["cover", "research", "about"] as const) assert.equal(readLabView(`?view=${view}`), view);
  for (const query of ["", "?view=%3Cscript%3E", "?concept=atlas&view=invalid"]) assert.equal(readLabView(query), "cover");
});
