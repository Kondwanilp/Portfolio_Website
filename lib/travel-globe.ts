export type GeoPoint = { lat: number; lon: number };
export type GlobeView = { longitude: number; latitude: number; zoom: number };
export type ProjectedPoint = { x: number; y: number; front: boolean };

export const visitedPlaces = [
  { name: "Lusaka, Zambia", lat: -15.3875, lon: 28.3228 },
  { name: "Doha, Qatar", lat: 25.2854, lon: 51.531 },
  { name: "Birmingham, Alabama", lat: 33.5186, lon: -86.8104 },
  { name: "Atlanta, Georgia", lat: 33.749, lon: -84.388 },
  { name: "Grambling, Louisiana", lat: 32.5276, lon: -92.714 },
  { name: "Jackson, Mississippi", lat: 32.2988, lon: -90.1848 },
  { name: "Shreveport, Louisiana", lat: 32.5252, lon: -93.7502 },
  { name: "Conyers, Georgia", lat: 33.6676, lon: -84.0177 },
  { name: "Lithonia, Georgia", lat: 33.7123, lon: -84.1052 },
] as const;

const radians = Math.PI / 180;

export function normalizeLongitude(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

export function projectPlace(point: GeoPoint, view: GlobeView): ProjectedPoint {
  const latitude = point.lat * radians;
  const angle = (point.lon - view.longitude) * radians;
  const tilt = view.latitude * radians;
  const x = Math.cos(latitude) * Math.sin(angle);
  const y =
    Math.sin(latitude) * Math.cos(tilt) -
    Math.cos(latitude) * Math.cos(angle) * Math.sin(tilt);
  const depth =
    Math.sin(latitude) * Math.sin(tilt) +
    Math.cos(latitude) * Math.cos(angle) * Math.cos(tilt);
  return {
    x: 180 + 145 * view.zoom * x,
    y: 170 - 145 * view.zoom * y,
    front: depth >= 0,
  };
}

export function globePath(points: readonly GeoPoint[], view: GlobeView) {
  let drawing = false;
  let path = "";
  for (const point of points) {
    const projected = projectPlace(point, view);
    if (projected.front)
      path += `${drawing ? "L" : "M"}${projected.x.toFixed(2)},${projected.y.toFixed(2)} `;
    drawing = projected.front;
  }
  return path;
}

/** Interpolate thread along the sphere, with no implied travel chronology. */
export function threadPoints(first: GeoPoint, second: GeoPoint): GeoPoint[] {
  function vector(point: GeoPoint) {
    return [
      Math.cos(point.lat * radians) * Math.cos(point.lon * radians),
      Math.cos(point.lat * radians) * Math.sin(point.lon * radians),
      Math.sin(point.lat * radians),
    ];
  }
  const start = vector(first);
  const end = vector(second);
  const angle = Math.acos(
    Math.max(
      -1,
      Math.min(
        1,
        start.reduce(
          (sum, coordinate, index) => sum + coordinate * end[index],
          0,
        ),
      ),
    ),
  );
  if (angle < 0.00001) return [first, second];
  return Array.from({ length: 65 }, (_, index) => {
    const progress = index / 64;
    const a = Math.sin((1 - progress) * angle) / Math.sin(angle);
    const b = Math.sin(progress * angle) / Math.sin(angle);
    const [x, y, z] = start.map(
      (coordinate, axis) => coordinate * a + end[axis] * b,
    );
    return {
      lat: Math.atan2(z, Math.hypot(x, y)) / radians,
      lon: Math.atan2(y, x) / radians,
    };
  });
}

/** Fan out pin heads while their metal tips retain the geographic anchors. */
export function arrangePins(points: (ProjectedPoint & { name: string })[]) {
  const pins: (ProjectedPoint & {
    name: string;
    headX: number;
    headY: number;
  })[] = [];
  for (const point of points) {
    let headX = Math.max(9, Math.min(351, point.x - 5));
    let headY = Math.max(9, Math.min(331, point.y - 16));
    for (let attempt = 0; attempt < 36; attempt++) {
      if (
        pins.every(
          (pin) => Math.hypot(pin.headX - headX, pin.headY - headY) >= 18,
        )
      )
        break;
      const angle = attempt * 2.4;
      const radius = 19 + Math.floor(attempt / 8) * 10;
      headX = Math.max(9, Math.min(351, point.x + Math.cos(angle) * radius));
      headY = Math.max(9, Math.min(331, point.y + Math.sin(angle) * radius));
    }
    pins.push({ ...point, headX, headY });
  }
  return pins;
}
