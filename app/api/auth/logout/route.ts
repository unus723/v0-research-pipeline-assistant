import { NextRequest, NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  revokeAccessToken,
} from "@/lib/supabase-auth"

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  await revokeAccessToken(accessToken)

  const response = NextResponse.redirect(new URL("/login", request.url), 303)
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  response.headers.set("Cache-Control", "private, no-store")

  return response
}
