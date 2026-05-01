import { ClerkProvider } from "@clerk/react-router"
import { Outlet } from "react-router"

export function AppLayout() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Outlet />
    </ClerkProvider>
  )
}
