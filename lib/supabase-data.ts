import { getSupabaseEnvStatus } from "@/lib/supabase-auth"

function getConfig() {
  const { url, publishableKey } = getSupabaseEnvStatus()
  if (!url || !publishableKey) return null

  return {
    url: url.replace(/\/$/, ""),
    publishableKey,
  }
}

async function supabaseFetch(path: string, accessToken: string, init: RequestInit = {}) {
  const config = getConfig()
  if (!config) throw new Error("Supabase is not configured.")

  return fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  })
}

export async function loadResearchProject(accessToken: string, userId: string) {
  const params = new URLSearchParams({
    select: "state,revision,updated_at",
    user_id: `eq.${userId}`,
    limit: "1",
  })

  const response = await supabaseFetch(`/rest/v1/research_projects?${params.toString()}`, accessToken)
  if (!response.ok) throw new Error(`Project load failed with status ${response.status}.`)

  const rows: unknown = await response.json()
  if (!Array.isArray(rows) || rows.length === 0) return null

  const row = rows[0]
  if (!row || typeof row !== "object") return null

  return row as {
    state: unknown
    revision: number
    updated_at: string
  }
}

export async function saveResearchProject(accessToken: string, userId: string, state: unknown) {
  const response = await supabaseFetch("/rest/v1/research_projects?on_conflict=user_id", accessToken, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      state,
      schema_version: 1,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => "")
    console.error("Supabase project save failed", { status: response.status, details: details.slice(0, 1000) })
    throw new Error(`Project save failed with status ${response.status}.`)
  }
}

export async function consumeMentorRateLimit(accessToken: string, limit = 20, windowSeconds = 600) {
  const response = await supabaseFetch("/rest/v1/rpc/consume_mentor_rate_limit", accessToken, {
    method: "POST",
    body: JSON.stringify({
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => "")
    console.error("Supabase rate limit RPC failed", { status: response.status, details: details.slice(0, 1000) })
    throw new Error(`Rate limit check failed with status ${response.status}.`)
  }

  const rows: unknown = await response.json()
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row || typeof row !== "object") throw new Error("Rate limit RPC returned an invalid response.")

  const value = row as Record<string, unknown>
  if (
    typeof value.allowed !== "boolean" ||
    typeof value.remaining !== "number" ||
    typeof value.reset_at !== "string"
  ) {
    throw new Error("Rate limit RPC returned an invalid response.")
  }

  return {
    allowed: value.allowed,
    remaining: value.remaining,
    resetAt: value.reset_at,
  }
}
