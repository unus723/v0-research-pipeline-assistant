import { NextRequest, NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  getSupabaseEnvStatus,
  refreshCookieOptions,
  signInWithPassword,
} from "@/lib/supabase-auth"

export async function POST(request: NextRequest) {
  const { missing } = getSupabaseEnvStatus()

  if (missing.length > 0) {
    console.error("Supabase auth configuration missing", { missing })
    return NextResponse.json(
      {
        error: "Supabase authentication is not configured.",
        missing,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }

  const formData = await request.formData()
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const next = String(formData.get("next") || "/")

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing_credentials", request.url), 303)
  }

  const session = await signInWithPassword(email, password)
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url), 303)
  }

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/"
  const response = NextResponse.redirect(new URL(safeNext, request.url), 303)

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    session.accessToken,
    accessCookieOptions(session.expiresIn),
  )
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    session.refreshToken,
    refreshCookieOptions(),
  )
  response.headers.set("Cache-Control", "private, no-store")

  return response
}
