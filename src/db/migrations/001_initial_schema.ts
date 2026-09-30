import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(255)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
