/**
 * Thin IBM Cloudant REST client.
 *
 * Set CLOUDANT_URL + IBM_CLOUD_API_KEY in .env.local to use real Cloudant.
 * Without those the module falls back to an in-process Map so the app still
 * works end-to-end in development without any IBM credentials.
 *
 * Required env vars:
 *   CLOUDANT_URL   — e.g. https://<host>.cloudantnosqldb.appdomain.cloud
 *   IBM_CLOUD_API_KEY — shared API key, also used for watsonx.ai
 *   CLOUDANT_DB    — (optional) defaults to "smallbox-finance"
 */

import { getIamToken } from "./ibm-iam";

export type CloudantDoc = {
  _id: string;
  _rev?: string;
  type: string;
  [key: string]: unknown;
};

const DB_NAME = process.env.CLOUDANT_DB ?? "smallbox-finance";

// ── In-process fallback ───────────────────────────────────────────────────────
// Used when CLOUDANT_URL is not set. Data lives for the lifetime of the
// Next.js server process — good enough for a demo or local dev session.
const store = new Map<string, CloudantDoc>();

export function isCloudantConfigured(): boolean {
  return Boolean(process.env.CLOUDANT_URL && process.env.IBM_CLOUD_API_KEY);
}

function baseUrl(): string {
  return `${process.env.CLOUDANT_URL!.replace(/\/+$/, "")}/${DB_NAME}`;
}

async function cfetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getIamToken();
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function ensureDb(): Promise<void> {
  const token = await getIamToken();
  const base = process.env.CLOUDANT_URL!.replace(/\/+$/, "");
  const r = await fetch(`${base}/${DB_NAME}`, {
    method: "HEAD",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (r.status === 404) {
    await fetch(`${base}/${DB_NAME}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    // Create an index on `type` so _find queries stay fast on the free tier
    await cfetch("/_index", {
      method: "POST",
      body: JSON.stringify({
        index: { fields: ["type"] },
        name: "type-index",
        type: "json",
      }),
    });
  }
}

// ── Public helpers ────────────────────────────────────────────────────────────

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function dbList<T extends CloudantDoc>(
  type: string,
): Promise<T[]> {
  if (!isCloudantConfigured()) {
    return Array.from(store.values()).filter((d) => d.type === type) as T[];
  }

  await ensureDb();
  const res = await cfetch("/_find", {
    method: "POST",
    body: JSON.stringify({
      selector: { type: { $eq: type } },
      limit: 1000,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudant _find error (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { docs: T[] };
  return data.docs;
}

export async function dbGet<T extends CloudantDoc>(
  id: string,
): Promise<T | null> {
  if (!isCloudantConfigured()) {
    return (store.get(id) as T | undefined) ?? null;
  }

  await ensureDb();
  const res = await cfetch(`/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Cloudant GET error (${res.status})`);
  return (await res.json()) as T;
}

export async function dbPut<T extends CloudantDoc>(doc: T): Promise<T> {
  if (!isCloudantConfigured()) {
    const saved = { ...doc, _rev: `local-${Date.now()}` } as T;
    store.set(doc._id, saved);
    return saved;
  }

  await ensureDb();
  const res = await cfetch(`/${encodeURIComponent(doc._id)}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  if (!res.ok && res.status !== 201 && res.status !== 202) {
    const body = await res.text();
    throw new Error(`Cloudant PUT error (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { rev?: string };
  return { ...doc, _rev: data.rev ?? doc._rev };
}

export async function dbDelete(id: string): Promise<void> {
  if (!isCloudantConfigured()) {
    store.delete(id);
    return;
  }

  await ensureDb();
  const existing = await dbGet(id);
  if (!existing?._rev) return;
  await cfetch(
    `/${encodeURIComponent(id)}?rev=${encodeURIComponent(existing._rev)}`,
    { method: "DELETE" },
  );
}
