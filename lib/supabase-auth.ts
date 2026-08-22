export const ACCESS_TOKEN_COOKIE = "ra_access_token"
export const REFRESH_TOKEN_COOKIE = "ra_refresh_token"

const DEFAULT_ACCESS_MAX_AGE = 60 * 60
const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 30

export interface AuthUser {
  id: string
  email?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) return null

  return {
    url: url.replace(/\/$/, ""),
    publishableKey,
  }
}

function authHeaders(publishableKey: string, accessToken?: string) {
  return {
    apikey: publishableKey,
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
}

function parseSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== "object") return null
  const data = value as Record<string, unknown>
  const user = data.user

  if (!user || typeof user !== "object") return null
  const userData = user as Record<string, unknown>

  if (
    typeof data.access_token !== "string" ||
    typeof data.refresh_token !== "string" ||
    typeof data.expires_in !== "number" ||
    typeof userData.id !== "string"
  ) {
    return null
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: Math.max(60, Math.floor(data.expires_in)),
    user: {
      id: userData.id,
      ...(typeof userData.email === "string" ? { email: userData.email } : {}),
    },
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession | null> {
  const config = getSupabaseConfig()
  if (!config) throw new Error("Supabase authentication is not configured.")

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(config.publishableKey),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  if (!response.ok) return null

  return parseSession(await response.json())
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: authHeaders(config.publishableKey),
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  })

  if (!response.ok) return null

  return parseSession(await response.json())
}

export async function verifyAccessToken(accessToken: string | undefined): Promise<AuthUser | null> {
  if (!accessToken) return null

  const config = getSupabaseConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/auth/v1/user`, {
    method: "GET",
    headers: authHeaders(config.publishableKey, accessToken),
    cache: "no-store",
  })

  if (!response.ok) return null

  const value: unknown = await response.json()
  if (!value || typeof value !== "object") return null

  const user = value as Record<string, unknown>
  if (typeof user.id !== "string") return null

  return {
    id: user.id,
    ...(typeof user.email === "string" ? { email: user.email } : {}),
  }
}

export async function revokeAccessToken(accessToken: string | undefined) {
  if (!accessToken) return

  const config = getSupabaseConfig()
  if (!config) return

  await fetch(`${config.url}/auth/v1/logout`, {
    method: "POST",
    headers: authHeaders(config.publishableKey, accessToken),
    cache: "no-store",
  }).catch(() => undefined)
}

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

export function accessCookieOptions(expiresIn?: number) {
  return authCookieOptions(expiresIn ?? DEFAULT_ACCESS_MAX_AGE)
}

export function refreshCookieOptions() {
  return authCookieOptions(DEFAULT_REFRESH_MAX_AGE)
}
