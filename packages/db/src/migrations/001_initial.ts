import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('role', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .execute()

  await db.schema
    .createTable('courses')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .execute()

  await db.schema
    .createTable('enrollments')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('student_id', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('course_id', 'integer', (col) => col.notNull().references('courses.id').onDelete('cascade'))
    .addColumn('enrolled_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .execute()

  await db.schema
    .createIndex('enrollments_student_course_idx')
    .on('enrollments')
    .columns(['student_id', 'course_id'])
    .unique()
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('enrollments').execute()
  await db.schema.dropTable('courses').execute()
  await db.schema.dropTable('users').execute()
}
