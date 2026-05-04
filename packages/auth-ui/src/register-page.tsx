import type { FormEvent } from "react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { useAuth, useSignUp } from "@clerk/react-router"
import { Button } from "@workspace/ui/components/base/button"
import { Input } from "@workspace/ui/components/base/input"

type Step = "details" | "verify"

export type RegisterPageProps = {
  afterRegisterPath?: string
  loginPath?: string
}

export function RegisterPage({
  afterRegisterPath = "/",
  loginPath = "/login",
}: RegisterPageProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { signUp } = useSignUp()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("details")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isLoaded) return null
  if (isSignedIn) return <Navigate to={afterRegisterPath} replace />

  async function handleRegister(e: FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: registerError } = await signUp.password({
      emailAddress: email,
      password,
    })
    if (registerError) {
      setError(registerError.message)
      setLoading(false)
      return
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode()
    if (sendError) {
      setError(sendError.message)
      setLoading(false)
      return
    }

    setStep("verify")
    setLoading(false)
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    })
    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    const { error: finalizeError } = await signUp.finalize()
    if (finalizeError) {
      setError(finalizeError.message)
      setLoading(false)
      return
    }

    navigate(afterRegisterPath)
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        {step === "details" ? (
          <>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-medium">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-label="Password"
              />

              <div id="clerk-captcha" />

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to={loginPath}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-medium">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a code to <span className="text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <Input
                placeholder="Verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoComplete="one-time-code"
                aria-label="Verification code"
              />

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify email"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Go back
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
