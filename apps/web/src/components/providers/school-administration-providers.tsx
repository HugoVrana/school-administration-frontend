import { StrictMode } from "react"
import { RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/providers/theme-provider.tsx"
import { router } from "@/router.tsx"

export function SchoolAdministrationProvider() {
  return (
    <StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>
  )
}
