import { NextRequest, NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshAuthSession,
  refreshCookieOptions,
  verifyAccessToken,
} from "@/lib/supabase-auth"

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith("/_next/")) return true
  if (pathname === "/favicon.ico") return true
  return false
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  const user = await verifyAccessToken(accessToken)

  if (user) {
    if (pathname === "/login") {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = "/"
      homeUrl.search = ""
      return NextResponse.redirect(homeUrl)
    }

    return NextResponse.next({
      request,
      headers: { "Cache-Control": "private, no-store" },
    })
  }

  if (refreshToken) {
    const refreshed = await refreshAuthSession(refreshToken)
    if (refreshed) {
      const response = pathname === "/login"
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next({ request })

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
      response.headers.set("Cache-Control", "private, no-store")
      return response
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next({
      request,
      headers: { "Cache-Control": "private, no-store" },
    })
  }

  return unauthorized(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
