/**
 * IBM Cloud IAM token management.
 * Caches tokens in process memory and refreshes them 60s before expiry.
 *
 * Supports two separate API keys:
 *   IBM_CLOUD_API_KEY  — used for Cloudant
 *   WATSONX_API_KEY    — used for watsonx.ai (falls back to IBM_CLOUD_API_KEY if not set)
 */

const cache: Record<string, { token: string; expiresAt: number }> = {};

async function fetchToken(apiKey: string): Promise<string> {
  const now = Date.now();
  const hit = cache[apiKey];
  if (hit && hit.expiresAt - 60_000 > now) return hit.token;

  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: apiKey,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IBM IAM token request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache[apiKey] = { token: data.access_token, expiresAt: now + data.expires_in * 1000 };
  return cache[apiKey]!.token;
}

/** Token for Cloudant — uses IBM_CLOUD_API_KEY */
export async function getIamToken(): Promise<string> {
  const apiKey = process.env.IBM_CLOUD_API_KEY;
  if (!apiKey) throw new Error("IBM_CLOUD_API_KEY is not set");
  return fetchToken(apiKey);
}

/** Token for watsonx.ai — prefers WATSONX_API_KEY, falls back to IBM_CLOUD_API_KEY */
export async function getWatsonxIamToken(): Promise<string> {
  const apiKey = process.env.WATSONX_API_KEY ?? process.env.IBM_CLOUD_API_KEY;
  if (!apiKey) throw new Error("Neither WATSONX_API_KEY nor IBM_CLOUD_API_KEY is set");
  return fetchToken(apiKey);
}

export function isIbmConfigured(): boolean {
  return Boolean(process.env.IBM_CLOUD_API_KEY);
}
