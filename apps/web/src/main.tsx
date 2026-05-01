import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import "@workspace/ui/globals.css"
import { SchoolAdministrationProvider } from "@/components/providers/school-administration-providers.tsx"
import { router } from "./router.tsx"

createRoot(document.getElementById("root")!).render(
  <SchoolAdministrationProvider>
    <RouterProvider router={router} />
  </SchoolAdministrationProvider>
)
