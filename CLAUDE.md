# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Governance repo and editorial source of truth for the **`social.opencontent.*`**
AT Protocol lexicon vocabulary (v1: `photograph`, `collection`, `site`).
The JSON under `lexicons/` is authoritative; the README's schema tables are
summaries of it — when they disagree, the JSON wins and the README is what
gets fixed.

## Commands

```sh
pnpm install
pnpm test       # vitest: schemas parse, every $ref self-resolves, records validate
pnpm typecheck  # tsc --noEmit
```

CI (`.github/workflows/ci.yml`) runs both on Node 24 for every push and PR.

## Hard rules

- **Read `GOVERNANCE.md` before touching any schema.** Evolution is
  additive-only: NSIDs never change, fields are only ever added (as optional),
  and existing constraints never change in place. Breaking changes mint a new
  NSID instead.
- The vendored `com.atproto.*` copies under `lexicons/com/atproto/` exist so
  the set self-resolves without depending on external core-schema copies (see
  README "Validation"). Never delete them; if upstream atproto changes them,
  sync — don't diverge.
- **Publication is pending.** The `opencontent.social` domain is unregistered,
  so the `@opencontent.social` steward account and DNS resolution do not exist
  yet. Never mark anything in the README's "Resolution" section as live.
- The README's "Consumer rules" section is contractual for the family's apps —
  never weaken or alter a rule.

## Consumers (sibling repos in the opensocial bucket)

- `openphotos` — ingests `photograph` + `collection` (still publishes legacy
  `social.luminance.*`; migration planned in its docs).
- `openportfolio` — mirrors these schemas in `@openportfolio/lexicons` and
  must never diverge from or front-run this repo. Schema changes land here first.
