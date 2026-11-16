import assert from "node:assert/strict";
import test from "node:test";
import { isLocalSpotifySetup } from "../lib/spotify-authorization.ts";

for (const hostname of ["localhost", "127.0.0.1"]) {
  test(`allows development setup on ${hostname}`, () => {
    assert.equal(isLocalSpotifySetup(hostname, "development"), true);
  });
  test(`blocks production setup on ${hostname}`, () => {
    assert.equal(isLocalSpotifySetup(hostname, "production"), false);
  });
}

for (const hostname of ["example.com", "localhost.example.com", "127.0.0.1.example.com", ""]) {
  test(`blocks non-loopback setup for ${hostname || "an empty hostname"}`, () => {
    assert.equal(isLocalSpotifySetup(hostname, "development"), false);
  });
}
