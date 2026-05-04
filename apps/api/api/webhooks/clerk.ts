import { handleClerkWebhookRequest, HttpError } from '../../src/clerk-user-sync.js'

export async function POST(request: Request): Promise<Response> {
  try {
    await handleClerkWebhookRequest(request)

    return Response.json({ received: true })
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Internal server error'

    console.error(message)

    return Response.json({ error: message }, { status })
  }
}
