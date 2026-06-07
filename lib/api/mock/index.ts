/**
 * Mock backend — public entry point
 * ----------------------------------------------------------------------------
 * A drop-in stand-in for the real `ai-expense-tracker-service`. When enabled,
 * `lib/api/client.ts` routes every request here instead of `fetch()`, so the
 * whole app (AI tools, change-set apply route, widgets) runs with zero backend.
 *
 * Why this exists: the live demo's backend can be offline (e.g. a paused
 * deployment). Rather than surfacing "Failed to fetch transactions", the app
 * serves realistic data from memory so the experience stays fully functional.
 *
 * Toggle (works the same locally and on Vercel — `NEXT_PUBLIC_*` is readable on
 * both client and server):
 *   • unset / anything but "false"  → mock ON  (default — demo works out of the box)
 *   • "false"                       → mock OFF (talk to NEXT_PUBLIC_API_BASE_URL)
 */

import { dispatch } from "./router"

/** Mock is the default so the deployed demo works without any backend config. */
export const isMockApiEnabled = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false"

/** A touch of latency so loading states render like they would against a real API. */
const MOCK_LATENCY_MS = 120

/**
 * Mirrors the signature of the real `apiClient`. Parses the endpoint, hands it
 * to the in-memory router, and returns data in the same shape the backend would.
 */
export async function mockApiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase()

  // Split "/transactions?limit=10" into a clean path + parsed query object.
  const [rawPath, rawQuery = ""] = endpoint.split("?")
  const query = Object.fromEntries(new URLSearchParams(rawQuery))

  let body: Record<string, unknown> = {}
  if (typeof options?.body === "string" && options.body.length > 0) {
    try {
      body = JSON.parse(options.body)
    } catch {
      body = {}
    }
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  return dispatch(method, rawPath, query, body) as T
}
