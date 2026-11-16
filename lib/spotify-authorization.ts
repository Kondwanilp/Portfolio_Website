/** Owner connection setup is available only on the local development server. */
export function isLocalSpotifySetup(hostname: string, environment: string | undefined) {
  return environment !== "production" && ["localhost", "127.0.0.1"].includes(hostname);
}
