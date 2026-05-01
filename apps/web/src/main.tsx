import { createRoot } from "react-dom/client"
import "@workspace/ui/globals.css"
import { SchoolAdministrationProvider } from "@/components/providers/school-administration-providers.tsx"

createRoot(document.getElementById("root")!).render(
  <SchoolAdministrationProvider />
)
