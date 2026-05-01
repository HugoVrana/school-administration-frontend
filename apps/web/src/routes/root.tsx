import { Navigate } from "react-router"
import { useAuth, useUser } from "@clerk/react-router"

export function RootRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/login" replace />

  const role = user?.publicMetadata?.role as string | undefined
  if (role === "admin") return <Navigate to="/admin" replace />
  if (role === "teacher") return <Navigate to="/teacher" replace />
  if (role === "student") return <Navigate to="/student" replace />

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Your account is pending role assignment.
      </p>
    </div>
  )
}
