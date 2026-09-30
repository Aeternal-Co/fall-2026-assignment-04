# Agentic Software Engineering: Automated ERD & Migration Pipeline

**Course:** Software Engineering / Agentic Engineering
**Topic:** Agentic Workflows, CLI Tooling, Deterministic Validation & Code Generation
**Tech Stack:** Node.js, TypeScript, Antigravity CLI (`agy`), Kysely, Mermaid CLI
**Total Points:** 10 Points

---

## Overview

In this assignment, you will transition from writing manual database schemas to engineering **Agentic Skills**—modular, deterministic capabilities that extend an AI software engineering agent.

You will build a multi-step agentic pipeline inside the Antigravity CLI (`agy`) consisting of two complementary skills:
1. **`erd-generator` (5 Points):** Accepts an unstructured domain description, drafts a Mermaid Entity-Relationship Diagram (`erDiagram`) inside `docs/architecture/`, executes a local Node.js script to validate syntax and compile a visual SVG asset, and self-corrects its output if compilation fails.
2. **`kysely-migration-generator` (5 Points):** Parses a compiled Mermaid ERD asset (`.mmd` or `.svg`) in `docs/architecture/` and translates it into a type-safe, production-ready Kysely database migration script inside `src/db/migrations/`.

By completing this assignment, you will demonstrate how to constrain generative AI models using local CLI tooling, executable scripts, and self-healing agent loops.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** LTS installed.
- **Docker & Docker Compose:** Installed and running (for local PostgreSQL database).
- **Antigravity CLI (`agy`):** Installed, logged in, and accessible in your shell environment.
- **NPM Package Manager:** `npm` (included with Node.js).

---

### Step 1: Install Dependencies & Start Database

Install the project dependencies and launch the PostgreSQL container:

```bash
# Install dependencies
npm install

# Start PostgreSQL database container in background
docker compose up -d
```

To stop the database container when you are done:

```bash
docker compose down
```

---

### Step 2: Verify the Existing Migration Setup

The starter repository includes an initial Kysely database migration (`src/db/migrations/001_initial_schema.ts`) and migration execution scripts configured in `package.json`.

Verify that your environment compiles and runs migrations cleanly:

```bash
# Compile TypeScript files
npm run build

# Run existing migrations
npm run migrate:up

# Roll back the migration (optional check)
npm run migrate:down
```

---

## Part 1: The `erd-generator` Skill (5 Points)

Your first goal is to construct a self-healing skill that converts domain requirements into a verified Mermaid ERD and renders a physical SVG diagram.

### 1. Skill Directory & Entrypoint

Create a skill directory at `.agent/skills/erd-generator/` containing:

* `SKILL.md` (Primary entrypoint and instruction file)
* `scripts/render_erd.js` (CLI validation and SVG compilation script)

### 2. The Renderer & Validator Script (`scripts/render_erd.js`)

Implement a Node.js script that takes an input Mermaid file (`docs/architecture/schema.mmd`) and compiles it to an SVG file (`docs/architecture/erd.svg`) using the pre-installed `@mermaid-js/mermaid-cli` binary (`npx mmdc`).

* **Success Behavior:** Compiles the SVG to `docs/architecture/erd.svg`, prints `SUCCESS`, and exits with code `0`.
* **Error Behavior:** Catches compilation errors, prints `SYNTAX_ERROR:` followed by the stderr trace, and exits with non-zero code `1`.

### 3. Skill Configuration (`SKILL.md`)

Write a `SKILL.md` file with valid YAML frontmatter and operational rules:

* **Frontmatter:** Include `name: erd-generator` and a descriptive `description` detailing trigger contexts (e.g., when requested to design an ERD, data model, or architecture diagram).
* **Execution Workflow:**
1. Parse domain requirements into entities, primary keys (`PK`), foreign keys (`FK`), and cardinalities.
2. Write the drafted Mermaid syntax directly to `docs/architecture/schema.mmd`.
3. Execute `node scripts/render_erd.js docs/architecture/schema.mmd`.
4. **Self-Correction Loop:** If execution fails with `SYNTAX_ERROR`, parse the error trace, adjust the Mermaid syntax in `docs/architecture/schema.mmd`, and re-run (up to 3 retries).
5. **Final Output:** Present the raw Mermaid block to the user and reference the generated image asset path (`docs/architecture/erd.svg`).



---

## Part 2: The `kysely-migration-generator` Skill (5 Points)

Your second goal is to create a downstream skill that consumes a Mermaid ERD and translates it into a type-safe Kysely database migration. You can inspect `src/db/migrations/001_initial_schema.ts` in the starter repo as your reference baseline for Kysely migration structure.

### 1. Skill Directory & Entrypoint

Create a skill directory at `.agent/skills/kysely-migration-generator/` containing:

* `SKILL.md` (Translation rules and structural guardrails)

### 2. Translation Rules (`SKILL.md`)

Configure `SKILL.md` with explicit mapping guardrails:

* **Entities $\rightarrow$ Tables:** Map Mermaid entities to snake_case table names (e.g., `USERS` $\rightarrow$ `users`).
* **Keys & Columns:** Convert `PK` attributes to auto-generating IDs/UUIDs and `FK` attributes to `.references().onDelete('cascade')`.
* **Cardinalities:** Correctly map `||--o{` (one-to-many) and `||--o|` (one-to-one with unique constraints).
* **File Output:** Write the generated TypeScript migration to `src/db/migrations/<timestamp>_<migration_name>.ts`.
* **Structure:** Enforce exports for both `up(db: Kysely<any>)` and `down(db: Kysely<any>)` functions. The `down` function must drop tables in reverse dependency order.

---

## 🧪 Verification & Demonstration Workflow

Test your completed agentic skills by passing your prompts to `agy`:

**Prompt 1 (Triggering Skill 1):**

Design an ERD for a library management system with users, books, genres, authors, borrowers, loans. Note that the relation for users has already been created. Make sure to be specific in your prompt with business decisions you make to remove ambiguity for the agent.

Verify that `docs/architecture/schema.mmd` and `docs/architecture/erd.svg` are created in your repository.

**Prompt 2 (Triggering Skill 2):**

Instruct the agent to read docs/architecture/schema.mmd and generate a Kysely migration script for it.

Verify that:

1. A new TypeScript migration file is created inside `src/db/migrations/`.
2. The project compiles without TypeScript errors (`npm run build`).
3. Your new migration executes against the database cleanly (`npm run migrate:up`).

---

## Grading Rubric

### Part 1: `erd-generator` Skill (5 Points Total)

* **Skill Registration & Frontmatter (1 Point):** `SKILL.md` has valid frontmatter (`name`, `description`) and triggers appropriately in `agy`.
* **Validation Script (1.5 Points):** `scripts/render_erd.js` correctly invokes `mmdc`, generates `docs/architecture/erd.svg` on success, and exits with non-zero status codes on syntax errors.
* **Self-Healing Loop & Rendering (2.5 Points):** The agent executes the script, successfully catches and fixes syntax errors when present, and delivers both the raw code block and rendered SVG path.

### Part 2: `kysely-migration-generator` Skill (5 Points Total)

* **Skill Registration & Frontmatter (1 Point):** `SKILL.md` has valid frontmatter and triggers appropriately on request.
* **Translation Mapping (2 Points):** Accurately converts Mermaid entities, data types, primary keys, and foreign keys into valid Kysely DDL calls.
* **Migration Execution & Code Quality (2 Points):** Generated TypeScript file exports valid `up` and `down` functions, drops tables in correct reverse dependency order, passes type-checking (`npm run build`), and executes via `npm run migrate:up`.
