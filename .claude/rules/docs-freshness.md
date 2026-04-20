---
paths:
  - "server/src/models/**"
  - "server/src/graphql/**"
  - "server/src/services/**"
  - "server/src/config/**"
  - "client/src/App.tsx"
  - "client/src/config/**"
  - "client/vite.config.ts"
  - ".github/workflows/**"
---

# Documentation Freshness

When editing files in these paths, consider whether the change affects behavior documented in the key repository docs:

- **REPO_SYNTHESIS.md** -- architecture, data models, API surface, invariants
- **.github/copilot-instructions.md** -- patterns, context map, conventions
- **CLAUDE.md** -- workspace commands, architecture, gotchas
- **docs/CONFIGURATION.md** -- environment variable reference

Before committing, verify:
1. Does this change alter any behavior, schema, API, or config described in those docs?
2. If yes, update the relevant doc section in the same commit.
3. The full mapping of which sources affect which docs is in `scripts/docs-freshness-map.json`.

The pre-commit hook will also warn at commit time, but catching staleness earlier saves a round-trip.
