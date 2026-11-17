import assert from "node:assert/strict";
import test from "node:test";
import {
  arrangePins,
  globePath,
  normalizeLongitude,
  projectPlace,
  threadPoints,
  visitedPlaces,
} from "../lib/travel-globe.ts";

test("globe projection preserves centers, occlusion, zoom and the owner's corrected cities", () => {
  const view = { longitude: 0, latitude: 0, zoom: 1 };
  assert.deepEqual(projectPlace({ lat: 0, lon: 0 }, view), {
    x: 180,
    y: 170,
    front: true,
  });
  assert.equal(projectPlace({ lat: 0, lon: 180 }, view).front, false);
  const center = projectPlace(
    { lat: 35, lon: -90 },
    { longitude: -90, latitude: 35, zoom: 3 },
  );
  assert.ok(
    Math.abs(center.x - 180) < 0.001 && Math.abs(center.y - 170) < 0.001,
  );
  const normal = projectPlace({ lat: 20, lon: 20 }, view);
  const zoomed = projectPlace({ lat: 20, lon: 20 }, { ...view, zoom: 2 });
  assert.ok(Math.abs(zoomed.x - 180 - (normal.x - 180) * 2) < 0.001);
  assert.ok(
    visitedPlaces.some((place) => place.name === "Jackson, Mississippi"),
  );
  assert.ok(
    visitedPlaces.some((place) => place.name === "Birmingham, Alabama"),
  );
  assert.equal(normalizeLongitude(550), -170);
});

test("thread follows great-circle endpoints and rear segments cannot cut across the visible globe", () => {
  const first = { lat: -15, lon: 28 };
  const second = { lat: 33, lon: -90 };
  const thread = threadPoints(first, second);
  assert.ok(Math.abs(thread[0].lat - first.lat) < 0.00001);
  assert.ok(Math.abs(thread.at(-1)!.lon - second.lon) < 0.00001);
  assert.ok(
    thread.every(
      (point) => Number.isFinite(point.lat) && Number.isFinite(point.lon),
    ),
  );
  assert.equal(
    globePath(
      [
        { lat: 0, lon: 170 },
        { lat: 0, lon: 180 },
      ],
      { longitude: 0, latitude: 0, zoom: 1 },
    ),
    "",
  );
  const crossing = globePath(
    [
      { lat: 0, lon: 0 },
      { lat: 0, lon: 180 },
      { lat: 10, lon: 0 },
    ],
    { longitude: 0, latitude: 0, zoom: 1 },
  );
  assert.equal((crossing.match(/M/g) ?? []).length, 2);
});

test("dense Georgia pins retain distinct heads and their real geographic anchors", () => {
  const points = Array.from({ length: 7 }, (_, index) => ({
    name: `City ${index}`,
    x: 100 + index / 10,
    y: 100,
    front: true,
  }));
  const pins = arrangePins(points);
  assert.equal(pins.length, points.length);
  for (let index = 0; index < pins.length; index++) {
    assert.equal(pins[index].x, points[index].x);
    for (const other of pins.slice(index + 1))
      assert.ok(
        Math.hypot(
          pins[index].headX - other.headX,
          pins[index].headY - other.headY,
        ) >= 18,
      );
  }
});
