# opencontent-lexicons

Governance repository and source-of-truth schema documents for
**`social.opencontent.*`** — a public, BDFL-governed
[AT Protocol](https://atproto.com) lexicon commons for user-generated
content.

## What this is

`social.opencontent.*` is a small set of record schemas for publishing
photographic work (and, in future additive releases, other media) as
records in your own AT Protocol repo — not inside any single app's
silo. A record published under these NSIDs lives in the *author's* PDS
and can be read, rendered, and re-published by any client, aggregator,
or portfolio site that understands the vocabulary, with no relationship
to this repository or its maintainer required.

This is a **UGC lexicon commons**: the schemas are free to read, free to
implement against, and free to publish records under, governed openly so
the vocabulary stays coherent as it grows. See `GOVERNANCE.md` for the
BDFL model, the additive-only evolution policy, and how governance can
transfer to a successor body later without ever changing an NSID. See
`LICENSE` (MIT) for the terms.

## v1 vocabulary

Three record types, deliberately minimal for v1.

### `social.opencontent.photograph`

One record = one photographic work (a diptych is two photographs placed
in a collection, not one record with two images).

| field | type | required | notes |
|---|---|---|---|
| `image` | blob | yes | raster allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/heic` — no SVG; 20MB advisory max (host PDS limit is the real ceiling) |
| `aspectRatio` | `{width, height}` (int, min 1) | yes | lets renderers lay out before fetching bytes |
| `createdAt` | datetime | yes | |
| `title` | string | no | ≤200 graphemes |
| `description` | string | no | ≤2000 graphemes; caption |
| `alt` | string | no | ≤2000 graphemes; accessibility text, distinct from caption |
| `exif` | object | no | all-optional: `camera`, `lens`, `focalLength`, `fNumber` (string — lexicons have no float type), `shutterSpeed`, `iso` (integer) |
| `tags` | string[] | no | ≤20 items, each ≤64 graphemes |
| `license` | string | no | ≤200; freeform, SPDX identifiers recommended |
| `location` | string | no | ≤200; a deliberate place statement, never auto-filled from GPS |
| `capturedAt` | datetime | no | |
| `labels` | `com.atproto.label.defs#selfLabels` | no | standard self-label/blur machinery |

### `social.opencontent.collection`

An ordered set of photographs displayed together as a gallery.

| field | type | required | notes |
|---|---|---|---|
| `title` | string | yes | ≤200 graphemes |
| `items` | `com.atproto.repo.strongRef[]` | yes | ≤500 items; **array order = display order** — the inline array is the authoritative order, reordered atomically via one `putRecord` |
| `createdAt` | datetime | yes | |
| `description` | string | no | ≤2000 graphemes |
| `cover` | `com.atproto.repo.strongRef` | no | falls back to the first resolvable item if absent |

### `social.opencontent.site`

The portfolio's public identity. One record per repo, rkey `self`.

| field | type | required | notes |
|---|---|---|---|
| `title` | string | yes | ≤200 graphemes |
| `createdAt` | datetime | yes | |
| `about` | string | no | ≤5000 graphemes |
| `collectionOrder` | string[] (record-key) | no | ≤100 rkeys — public-site nav order, in-repo rkeys rather than full at-uris since a site record can only ever order collections in its own repo |
| `links` | `{label ≤50, uri}[]` | no | ≤10 entries |
| `theme` | string | no | ≤64; freeform, product-specific values allowed |

**Rkeys:** TIDs for photographs and collections; the literal `self` for
site.

The full field-level schema documents are the JSON files under
`lexicons/social/opencontent/` — this table is a summary, the JSON is
authoritative.

## Consumer rules

Every client, aggregator, and renderer that consumes `social.opencontent.*`
records must follow these rules. They exist to make additive schema
evolution and normal record deletion safe for consumers to ignore rather
than something they need to special-case or error on.

- **Dangling refs are skipped, never an error.** A `collection.items` or
  `collection.cover` entry that points at a deleted (or otherwise
  unresolvable) photograph must be silently skipped by the renderer. It
  is not a validation failure and must not surface as one.
- **Unknown fields are ignored.** Because the vocabulary only evolves by
  addition (see `GOVERNANCE.md`), a consumer built against an older
  version of a schema will see fields it doesn't recognize on newer
  records. Ignore them; do not reject the record.
- **Unlisted collections render after the ordered ones, newest first.**
  A collection whose rkey is absent from `site.collectionOrder` is not
  hidden — it's simply unordered. Renderers must still display it,
  appended after the explicitly ordered collections, sorted
  newest-first by `createdAt`. Hiding a collection is either deleting it
  or (in a future additive field, if one is ever added) an explicit
  opt-out — never an implicit side effect of leaving it out of the nav
  order.

## Resolution (publication pending)

> **Status: publication pending.** The `opencontent.social` domain has
> not been registered yet, so nothing below is live. This section
> documents the resolution design the schemas are built against, and
> will be updated the moment publication actually happens.

- **Authority:** `opencontent.social`. Lexicon resolution for every
  `social.opencontent.*` NSID is anchored at this one domain.
- **One `_lexicon.opencontent.social` TXT record** resolves to the
  steward DID. This is the entire DNS footprint required to resolve the
  vocabulary — no website needs to exist at the domain for v1.
- **Steward account:** `@opencontent.social`. The canonical schema
  documents are published as `com.atproto.lexicon.schema` records in
  this account's own AT Protocol repo, which is the actual source of
  truth once published (this GitHub repository is the source of truth
  for what gets published there).
- This repository (`iserlabs/opencontent-lexicons`) is the pre-publication
  source of truth and stays the editorial source of truth after
  publication — changes land here first, then get pushed to the steward
  account's repo.

## Validation

`src/schemas.test.ts` validates the set with `@atproto/lexicon`: every
schema document parses, every `$ref` in the set resolves, and a
well-formed record of each type validates while a malformed one doesn't.
The copies of `com.atproto.repo.strongRef` and `com.atproto.label.defs`
under `lexicons/com/atproto/` are included so the lexicon set is
self-resolving without depending on an external copy of the core ATProto
schemas.

```sh
pnpm install
pnpm test
pnpm typecheck
```

CI (`.github/workflows/ci.yml`) runs both on every push and pull request.
