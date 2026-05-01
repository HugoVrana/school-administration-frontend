import { StrictMode } from "react"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/providers/theme-provider.tsx"

export function SchoolAdministrationProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <StrictMode>
      <ThemeProvider>{children}</ThemeProvider>
    </StrictMode>
  )
}
