type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}

function getErrorMessage(code?: string) {
  if (code === "missing_credentials") return "Enter both email and password."
  if (code === "invalid_credentials") return "Invalid email or password."
  return null
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const errorMessage = getErrorMessage(params.error)
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/"

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Research Pipeline Assistant</h1>
          <p className="text-sm text-muted-foreground">Private access</p>
        </div>

        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}
