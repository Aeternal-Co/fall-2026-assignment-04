import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('authors')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('bio', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();

  await db.schema
    .createTable('genres')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();

  await db.schema
    .createTable('borrowers')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().unique().references('users.id').onDelete('cascade')
    )
    .addColumn('membership_number', 'varchar(50)', (col) =>
      col.notNull().unique()
    )
    .addColumn('phone', 'varchar(20)')
    .addColumn('membership_status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('active')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();

  await db.schema
    .createTable('books')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('isbn', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('genre_id', 'integer', (col) =>
      col.notNull().references('genres.id').onDelete('cascade')
    )
    .addColumn('published_year', 'integer')
    .addColumn('total_copies', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();

  await db.schema
    .createTable('book_authors')
    .addColumn('book_id', 'integer', (col) =>
      col.notNull().references('books.id').onDelete('cascade')
    )
    .addColumn('author_id', 'integer', (col) =>
      col.notNull().references('authors.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('book_authors_pk', ['book_id', 'author_id'])
    .execute();

  await db.schema
    .createTable('loans')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('book_id', 'integer', (col) =>
      col.notNull().references('books.id').onDelete('cascade')
    )
    .addColumn('borrower_id', 'integer', (col) =>
      col.notNull().references('borrowers.id').onDelete('cascade')
    )
    .addColumn('borrowed_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .addColumn('due_date', 'date', (col) => col.notNull())
    .addColumn('return_date', 'date')
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('active')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('loans').execute();
  await db.schema.dropTable('book_authors').execute();
  await db.schema.dropTable('books').execute();
  await db.schema.dropTable('genres').execute();
  await db.schema.dropTable('borrowers').execute();
  await db.schema.dropTable('authors').execute();
}
