import { Navigate, Outlet } from "react-router"
import { useAuth, useUser } from "@clerk/react-router"

export function TeacherLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (user?.publicMetadata?.role !== "teacher")
    return <Navigate to="/" replace />

  return <Outlet />
}
