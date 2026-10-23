## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues; use `gh`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: read the root glossary and relevant ADRs when present. See `docs/agents/domain.md`.

## Project context

This pnpm/Turborepo monorepo contains four Astro sites under `apps/`, shared content code in `packages/content`, and shared site UI in `packages/ui`. See `README.md` for the app map and commands.

For architecture, decisions, migration history, and remaining work, consult the relevant sections of `docs/sova-web-monorepo-plan.md`. It is the maintained project-status source; read the whole plan only when the task spans the migration. Use the current code and live configuration to verify status-sensitive claims.

For app-specific work, start with that app's README and files. Inspect Git/Delta history only when provenance or prior user decisions matter; the plan records decisions recovered from project and Delta history. For UI work, prefer `agent-browser` for browser verification and check for existing dev servers before starting another.
