import { NextRequest, NextResponse } from "next/server"

import { isValidProjectState } from "@/lib/project-state"
import { loadResearchProject, saveResearchProject } from "@/lib/supabase-data"
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "@/lib/supabase-auth"

export const runtime = "nodejs"

const MAX_PROJECT_BYTES = 512 * 1024

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

async function authenticate(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) return null

  const user = await verifyAccessToken(accessToken)
  if (!user) return null

  return { accessToken, user }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth) return json({ error: "Authentication required." }, 401)

    const project = await loadResearchProject(auth.accessToken, auth.user.id)
    if (!project) return json({ project: null })

    if (!isValidProjectState(project.state)) {
      console.error("Stored project state failed validation", { userId: auth.user.id })
      return json({ error: "Stored project state is invalid." }, 500)
    }

    return json({
      project: project.state,
      revision: project.revision,
      updatedAt: project.updated_at,
    })
  } catch (error) {
    console.error("Project load failed", error)
    return json({ error: "Unable to load project." }, 503)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth) return json({ error: "Authentication required." }, 401)

    const contentLength = Number(request.headers.get("content-length") || "0")
    if (contentLength > MAX_PROJECT_BYTES) {
      return json({ error: "Project state is too large." }, 413)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400)
    }

    if (JSON.stringify(body).length > MAX_PROJECT_BYTES) {
      return json({ error: "Project state is too large." }, 413)
    }

    if (!isValidProjectState(body)) {
      return json({ error: "Invalid project state." }, 400)
    }

    await saveResearchProject(auth.accessToken, auth.user.id, body)
    return json({ saved: true })
  } catch (error) {
    console.error("Project save failed", error)
    return json({ error: "Unable to save project." }, 503)
  }
}
