/** Web3Forms access keys are public form identifiers. No mailbox credentials are sent. */
export async function sendAnimeRecommendation(
  accessKey: string,
  message: string,
  botcheck: boolean,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  const text = message.trim();
  if (!accessKey.trim() || !text || text.length > 1000)
    throw new Error("Invalid recommendation");
  const response = await fetcher("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal,
    body: JSON.stringify({
      access_key: accessKey.trim(),
      subject: "An anime recommendation · Kondwani’s portfolio",
      from_name: "Portfolio recommendations",
      message: text,
      botcheck,
    }),
  });
  const result: unknown = await response.json();
  if (
    !response.ok ||
    typeof result !== "object" ||
    result === null ||
    !("success" in result) ||
    result.success !== true
  )
    throw new Error("Delivery unconfirmed");
}
