---
name: kysely-migration-generator
description: Translate Mermaid entity-relationship diagrams into PostgreSQL migrations using Kysely and TypeScript. Use when asked to generate or update a database migration from an ERD, including Mermaid .mmd or rendered .svg files in docs/architecture/.
---

# Kysely Migration Generator

Create a migration at `src/db/migrations/<timestamp>_<migration_name>.ts` that implements the ERD and can be reversed by its own `down` function.

## Read the Inputs

1. Read the requested ERD, defaulting to `docs/architecture/schema.mmd`. When given an SVG, prefer its corresponding Mermaid source if available and consistent with the diagram; otherwise inspect the SVG's entities, attributes, keys, and relationships. Clarify unreadable or ambiguous details instead of inventing constraints.
2. Read `src/db/migrations/001_initial_schema.ts`, subsequent migrations, and `src/db/migrator.ts` to determine the existing schema and migration conventions. The starter migration already creates `users`; reference existing tables without recreating them. Add requested changes in a new migration rather than editing previously applied migrations.
3. Identify each new table, its columns and constraints, and its dependencies before writing code. Preserve explicit business rules and state assumptions when the ERD omits details.

## Translation Rules

### Entities and Columns

- Convert entity and attribute names to snake_case, preserving their meaning and singular/plural form: `USERS` becomes `users`, `LOAN_ITEMS` becomes `loan_items`, and `createdAt` becomes `created_at`.
- Use concrete PostgreSQL column types supported by Kysely:

  | ERD type | PostgreSQL / Kysely type |
  | --- | --- |
  | `int`, `integer` | `integer` |
  | `bigint` | `bigint` |
  | `string`, `text` | `text`, or `varchar(n)` when a length is specified |
  | `uuid` | `uuid` |
  | `bool`, `boolean` | `boolean` |
  | `date` | `date` |
  | `datetime`, `timestamp` | `timestamp`; use `timestamptz` when timezone semantics are specified |
  | `decimal`, `numeric` | `numeric`, preserving specified precision and scale |
  | `float`, `double` | `double precision` |
  | `json`, `jsonb` | The corresponding `json` or `jsonb` type |

- Preserve explicit defaults, unique (`UK`) markers, and nullability. Use `.notNull()` for required attributes and document assumptions for unspecified nullability. Do not silently replace unsupported or ambiguous types with `text`.

### Primary and Foreign Keys

- Give standalone numeric `PK` attributes database-generated values. Follow the starter's `.addColumn('id', 'serial', (col) => col.primaryKey())` for integer IDs; use `bigserial` for bigint IDs.
- For UUID `PK` attributes, use `.addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))` and import `sql` from `kysely`. Generation belongs in the database default, not in a JavaScript value computed once while migrating.
- Preserve explicitly modeled composite keys with `.addPrimaryKeyConstraint(...)`. A shared primary key that is also an FK must use the referenced value rather than generate an unrelated ID.
- Translate each single-column `FK` to `.references('parent_table.primary_key').onDelete('cascade')`. For example: `.addColumn('user_id', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))`.
- Match an FK's type to the referenced key's stored type: use `integer` for a `serial` parent, `bigint` for `bigserial`, and `uuid` for UUIDs. Do not give FK columns independent generated defaults. Reference the actual key name, which need not be `id`.
- For composite foreign keys, use a table-level `.addForeignKeyConstraint(...)` with matching column order and `(constraint) => constraint.onDelete('cascade')`.

### Cardinalities

- `PARENT ||--o{ CHILD` means one-to-many: put a non-null FK in `child` referencing `parent`. Do not make that FK unique; multiple children may reference the same parent.
- `PARENT ||--o| CHILD` means one-to-zero-or-one: put a non-null FK in `child` referencing `parent` and add `.unique()` to that FK, or an equivalent unique constraint over a composite FK.
- In both examples, `||` requires every child row to have a parent. The `o` at the child endpoint permits a parent to have no child rows; it does not make the child's parent FK nullable. Read both endpoints when a relationship is reversed or has different optionality.
- Represent many-to-many relationships with a junction table containing FKs to both parents and a composite primary key or unique constraint preventing duplicate pairs, unless the requirements explicitly allow repeated pairs.

## Migration Structure

1. Write `src/db/migrations/<timestamp>_<migration_name>.ts`, using a unique UTC `YYYYMMDDHHmmss` timestamp and a descriptive snake_case name. Ensure the filename sorts after existing migrations; never overwrite one.
2. Import `Kysely` from `kysely`, and import `sql` when SQL defaults or expressions require it. Export both `async function up(db: Kysely<any>): Promise<void>` and `async function down(db: Kysely<any>): Promise<void>`.
3. In `up`, create referenced parent tables before dependent child or junction tables. Use Kysely's schema builders and `await` every `.execute()` call. Existing tables participate in dependency checks but are not recreated.
4. In `down`, drop only tables created by this migration, in reverse dependency order: junction and child tables before their parents. Reverse any alterations made by `up`, including constraints added to existing tables, without dropping pre-existing tables such as `users`.
5. If dependencies form a cycle, create the tables first and add the cyclic FKs with `alterTable` afterward. Remove those constraints before dropping tables in `down`. Do not use cascading table drops to conceal ordering problems.

## Validation and Delivery

- Run `npm run build` from the repository root and fix TypeScript errors introduced by the migration.
- Review the migration against the ERD: verify column types, generated keys, FK targets, cascade behavior, nullability, uniqueness, and creation/drop order.
- When applying the migration is part of the request, run `npm run migrate:up` against the configured database and report its result. Distinguish connection failures from migration SQL errors.
- Return the generated file path, a brief description of the schema changes and assumptions, and the validation results. State whether the migration was applied; type-checking alone does not verify database execution.
