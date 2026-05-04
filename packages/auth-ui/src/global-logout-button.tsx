import { SignOut } from "@phosphor-icons/react"
import { SignOutButton, useAuth } from "@clerk/react-router"
import { Button } from "@workspace/ui/components/base/button"

export type GlobalLogoutButtonProps = {
  redirectUrl?: string
}

export function GlobalLogoutButton({
  redirectUrl = "/login",
}: GlobalLogoutButtonProps) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <SignOutButton redirectUrl={redirectUrl}>
        <Button type="button" variant="outline" size="sm" className="shadow-sm">
          <SignOut data-icon="inline-start" aria-hidden="true" />
          Log out
        </Button>
      </SignOutButton>
    </div>
  )
}
