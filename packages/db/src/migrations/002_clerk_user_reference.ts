import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('clerk_id', 'varchar(255)')
    .addColumn('requested_role', 'varchar(50)')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await sql`alter table users alter column name drop not null`.execute(db)
  await sql`alter table users alter column role drop not null`.execute(db)

  await db.schema.createIndex('users_clerk_id_idx').on('users').column('clerk_id').unique().execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('users_clerk_id_idx').ifExists().execute()

  await sql`update users set name = email where name is null`.execute(db)
  await sql`update users set role = requested_role where role is null and requested_role is not null`.execute(db)
  await sql`update users set role = 'student' where role is null`.execute(db)
  await sql`alter table users alter column name set not null`.execute(db)
  await sql`alter table users alter column role set not null`.execute(db)

  await db.schema.alterTable('users').dropColumn('updated_at').dropColumn('requested_role').dropColumn('clerk_id').execute()
}
