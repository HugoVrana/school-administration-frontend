import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import type { Database } from './schema.js'

const { Pool } = pg

export function createDb(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: true,
          ca: process.env.PG_CERT?.replace(/\\n/g, '\n'),
        },
      }),
    }),
  })
}
