import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { useSignUp, useAuth } from "@clerk/react-router"
import { Button } from "@workspace/ui/components/base/button"
import { Input } from "@workspace/ui/components/base/input"

type Step = "details" | "verify"

export function RegisterPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { signUp, setActive } = useSignUp()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("details")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isLoaded) return null
  if (isSignedIn) return <Navigate to="/" replace />

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!signUp) return

    setLoading(true)
    setError(null)

    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setStep("verify")
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] }
      setError(clerkError.errors?.[0]?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!signUp) return

    setLoading(true)
    setError(null)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        navigate("/")
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] }
      setError(clerkError.errors?.[0]?.message ?? "Invalid code")
    } finally {
      setLoading(false)
    }
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
              <div className="flex gap-2">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
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
                autoComplete="new-password"
              />

              <div id="clerk-captcha" />

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
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
              />

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying…" : "Verify email"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <button
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
