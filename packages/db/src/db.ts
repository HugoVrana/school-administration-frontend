import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import type { Database } from './schema.js'

const { Pool } = pg

function createPool(user: string | undefined, password: string | undefined) {
  return new Pool({
    host: process.env.PG_URL,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user,
    password,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.PG_CERT?.replace(/\\n/g, '\n'),
    },
  })
}

export function createDb(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: createPool(process.env.PG_USER, process.env.PG_PASSWORD),
    }),
  })
}

export function createAdminDb(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: createPool(process.env.PG_ADMIN_USER, process.env.PG_ADMIN_PASSWORD),
    }),
  })
}
