import type { UserJSON } from '@clerk/backend'
import { verifyWebhook, type WebhookEvent } from '@clerk/backend/webhooks'
import { createDb, type NewUser, type UserRole } from '@school/db'
import { sql } from 'kysely'
import { createServer, type IncomingHttpHeaders, type IncomingMessage, type ServerResponse } from 'node:http'

const requiredEnv = ['CLERK_WEBHOOK_SIGNING_SECRET', 'PG_URL', 'PG_PORT', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD', 'PG_CERT']

for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`${key} is not set`)
}

const userRoles = ['admin', 'teacher', 'student'] as const
const db = createDb()
const port = Number(process.env.PORT ?? 4000)

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, { ok: true })
      return
    }

    if (request.method === 'POST' && request.url === '/api/webhooks/clerk') {
      await handleClerkWebhook(request)
      sendJson(response, 200, { received: true })
      return
    }

    sendJson(response, 404, { error: 'Not found' })
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Internal server error'

    console.error(message)
    sendJson(response, status, { error: message })
  }
})

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})

async function handleClerkWebhook(request: IncomingMessage): Promise<void> {
  const body = await readBody(request)
  const webhookRequest = new Request(getRequestUrl(request), {
    method: request.method,
    headers: toHeaders(request.headers),
    body,
  })
  const event = await verifyClerkWebhook(webhookRequest)

  if (event.type === 'user.created' || event.type === 'user.updated') {
    await upsertClerkUser(event.data)
  }
}

async function verifyClerkWebhook(request: Request): Promise<WebhookEvent> {
  try {
    return await verifyWebhook(request)
  } catch {
    throw new HttpError(400, 'Webhook verification failed')
  }
}

async function upsertClerkUser(user: UserJSON): Promise<void> {
  const email = getPrimaryEmail(user)

  if (!email) {
    throw new HttpError(422, `Clerk user ${user.id} does not have an email address`)
  }

  const syncedUser: NewUser = {
    clerk_id: user.id,
    email,
    name: getDisplayName(user),
    role: parseUserRole(user.public_metadata.role),
    requested_role: parseUserRole(user.unsafe_metadata.requestedRole),
  }

  await db.transaction().execute(async (trx) => {
    const existingUser = await trx
      .selectFrom('users')
      .select('id')
      .where('clerk_id', '=', user.id)
      .executeTakeFirst()

    if (existingUser) {
      await trx
        .updateTable('users')
        .set({ ...syncedUser, updated_at: sql<Date>`now()` })
        .where('id', '=', existingUser.id)
        .execute()
      return
    }

    await trx
      .insertInto('users')
      .values(syncedUser)
      .onConflict((oc) =>
        oc.column('email').doUpdateSet({
          ...syncedUser,
          updated_at: sql<Date>`now()`,
        }),
      )
      .execute()
  })
}

function getPrimaryEmail(user: UserJSON): string | undefined {
  const primaryEmail = user.email_addresses.find((email) => email.id === user.primary_email_address_id)

  return primaryEmail?.email_address ?? user.email_addresses[0]?.email_address
}

function getDisplayName(user: UserJSON): string | null {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')

  return name || user.username || null
}

function parseUserRole(role: unknown): UserRole | null {
  if (userRoles.includes(role as UserRole)) return role as UserRole

  return null
}

async function readBody(request: IncomingMessage): Promise<string> {
  request.setEncoding('utf8')

  let body = ''

  for await (const chunk of request) {
    body += chunk
  }

  return body
}

function getRequestUrl(request: IncomingMessage): string {
  const host = request.headers.host ?? `localhost:${port}`

  return `http://${host}${request.url ?? '/'}`
}

function toHeaders(headers: IncomingHttpHeaders): Headers {
  const normalizedHeaders = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) normalizedHeaders.append(key, item)
    } else if (typeof value === 'string') {
      normalizedHeaders.set(key, value)
    }
  }

  return normalizedHeaders
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

async function shutdown(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })

  await db.destroy()
}

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0))
})

process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0))
})
