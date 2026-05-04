import { ClerkProvider } from "@clerk/react-router"
import { Outlet } from "react-router"
import { GlobalLogoutButton } from "@/components/auth/global-logout-button"

export function AppLayout() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Outlet />
      <GlobalLogoutButton />
    </ClerkProvider>
  )
}
