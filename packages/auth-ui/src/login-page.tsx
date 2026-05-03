import type { FormEvent } from "react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { useAuth, useSignIn } from "@clerk/react-router"
import { Button } from "@workspace/ui/components/base/button"
import { Input } from "@workspace/ui/components/base/input"

export type LoginPageProps = {
  afterSignInPath?: string
  registerPath?: string
}

export function LoginPage({
  afterSignInPath = "/",
  registerPath = "/register",
}: LoginPageProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { signIn } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isLoaded) return null
  if (isSignedIn) return <Navigate to={afterSignInPath} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: createError } = await signIn.create({ identifier: email })
    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    const { error: passwordError } = await signIn.password({ password })
    if (passwordError) {
      setError(passwordError.message)
      setLoading(false)
      return
    }

    const { error: finalizeError } = await signIn.finalize()
    if (finalizeError) {
      setError(finalizeError.message)
      setLoading(false)
      return
    }

    navigate(afterSignInPath)
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-medium">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to={registerPath}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
