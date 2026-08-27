import { NextRequest, NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshAuthSession,
  refreshCookieOptions,
  verifyAccessToken,
} from "@/lib/supabase-auth"
import { consumeMentorRateLimit } from "@/lib/supabase-data"

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"])
const MENTOR_RATE_LIMIT = 20
const MENTOR_RATE_WINDOW_SECONDS = 10 * 60

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith("/_next/")) return true
  if (pathname === "/favicon.ico") return true
  return false
}

function withPrivateNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    )
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

async function enforceMentorRateLimit(request: NextRequest, accessToken: string) {
  if (request.nextUrl.pathname !== "/api/mentor" || request.method !== "POST") return null

  try {
    const result = await consumeMentorRateLimit(
      accessToken,
      MENTOR_RATE_LIMIT,
      MENTOR_RATE_WINDOW_SECONDS,
    )

    if (result.allowed) return null

    const retryAfter = Math.max(
      1,
      Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000),
    )

    return NextResponse.json(
      {
        error: "AI Mentor rate limit exceeded.",
        retryAfterSeconds: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(MENTOR_RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetAt,
        },
      },
    )
  } catch (error) {
    console.error("Mentor rate limit check failed", error)
    return NextResponse.json(
      { error: "AI Mentor is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  const user = await verifyAccessToken(accessToken)

  if (user && accessToken) {
    if (pathname === "/login") {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = "/"
      homeUrl.search = ""
      return NextResponse.redirect(homeUrl)
    }

    const rateLimitResponse = await enforceMentorRateLimit(request, accessToken)
    if (rateLimitResponse) return rateLimitResponse

    return withPrivateNoStore(NextResponse.next())
  }

  if (refreshToken) {
    const refreshed = await refreshAuthSession(refreshToken)
    if (refreshed) {
      if (pathname !== "/login") {
        const rateLimitResponse = await enforceMentorRateLimit(request, refreshed.accessToken)
        if (rateLimitResponse) return rateLimitResponse
      }

      const response = pathname === "/login"
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next()

      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        refreshed.accessToken,
        accessCookieOptions(refreshed.expiresIn),
      )
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        refreshed.refreshToken,
        refreshCookieOptions(),
      )
      return withPrivateNoStore(response)
    }
  }

  if (isPublicPath(pathname)) {
    return withPrivateNoStore(NextResponse.next())
  }

  return unauthorized(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
