---
name: erd-generator
description: Design and validate Mermaid entity-relationship diagrams from domain requirements and render them as SVGs. Use when asked to create or revise an ERD, database schema, data model, or architecture diagram describing data entities and their relationships.
---

# ERD Generator

Produce a Mermaid `erDiagram` at `docs/architecture/schema.mmd` and a validated SVG at `docs/architecture/erd.svg`.

## Workflow

1. Parse the domain requirements into entities, attributes, primary keys (`PK`), foreign keys (`FK`), and relationship cardinalities. Capture whether each relationship is required or optional and one-to-one, one-to-many, or many-to-many. Use junction entities for many-to-many relationships. Respect existing schema definitions when supplied; clarify consequential missing business rules or state reasonable assumptions.

2. Create `docs/architecture/` if needed. Write the draft directly to `docs/architecture/schema.mmd`, starting with `erDiagram`. Include attribute types and `PK`/`FK` markers, and encode the chosen cardinalities in Mermaid relationships. Write plain Mermaid source without Markdown fences in the file.

3. Run the bundled [renderer](scripts/render_erd.js). Input and output paths are relative to the working directory, so execute it from the repository root:

   ```bash
   node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd
   ```

   Here, `scripts/render_erd.js` is relative to this skill's directory; the command above resolves that location while keeping diagram paths relative to the repository root. The renderer invokes the installed Mermaid CLI through `npx mmdc`.

4. Validate the result and self-correct:
   - On exit code `0` with `SUCCESS`, confirm that `docs/architecture/erd.svg` exists and is nonempty.
   - On exit code `1` with `SYNTAX_ERROR:`, read the stderr trace. For Mermaid syntax errors, fix `docs/architecture/schema.mmd` while preserving the intended data model, then rerun the same command.
   - Allow at most **3 retries after the initial attempt** (4 render attempts total). Stop as soon as rendering succeeds.
   - If the trace identifies an execution or setup failure rather than invalid Mermaid syntax, report the blocker instead of repeatedly rewriting the diagram.
   - If all retries fail, report the final error and the draft source path. Do not claim that an existing SVG was generated or validated by the failed run.

5. After successful rendering, read the final `docs/architecture/schema.mmd` and present its complete contents in a fenced `mermaid` block. Reference the generated SVG at `docs/architecture/erd.svg`, and briefly state any modeling assumptions.
