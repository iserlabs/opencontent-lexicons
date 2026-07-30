# Governance

This repository governs the `social.opencontent.*` lexicon — a set of
[AT Protocol](https://atproto.com) schema documents for user-generated
content (photographs, collections, and site configuration). It is a
BDFL-governed commons: the schemas are free to adopt by anyone, forever,
under simple published rules.

## Model: BDFL

**Kevin K. Lee decides.** This project is governed by a Benevolent
Dictator For Life (BDFL) model, not a committee, foundation, or vote.
Kevin has final say over every schema document merged into this repository
and every record published under the steward account.

This is a deliberate choice, not a placeholder for "governance we'll add
later." A young vocabulary needs a single accountable decision-maker to
move fast and keep the schemas coherent. The
[standardization exit](#standardization-exit-how-the-bdfl-role-transfers)
section below describes how that authority can hand off later without
touching the vocabulary itself.

## How to propose a change

- Open an **issue** to discuss a new field, a new record type, or a
  problem with an existing schema before writing code.
- Open a **pull request** with the concrete schema diff once there's
  rough consensus (or just to make the proposal concrete — PRs are
  welcome as the starting point for discussion too).
- Kevin reviews and merges. There is no voting body and no quorum
  requirement; disagreement is resolved by the BDFL, same as any other
  BDFL-governed open source project (Python's early PEP process, Linux
  pre-Linux Foundation, etc.).

## Anyone may adopt the vocabulary without permission

You do not need Kevin's approval, a license grant, or a registration
step to write or read `social.opencontent.*` records in your own AT
Protocol repo, or to build a client, aggregator, or PDS extension that
understands them. The schemas are published precisely so that any AT
Protocol app can speak this vocabulary. Publishing a record under these
NSIDs does not require contacting the steward account, opening an issue,
or signing anything — that's the entire point of a public, permissively
licensed lexicon (see `LICENSE`).

What *does* require going through this repo is changing the shape of the
vocabulary itself — see below.

## Evolution policy: additive-only

Once a schema is published (i.e., merged to `main` and resolvable via the
DNS-anchored authority described in the README), it can only evolve by
**addition**:

- New **optional** fields may be added to an existing record type.
- New **record types** may be added to the `social.opencontent.*`
  namespace.
- New **optional refs/unions** (e.g., a new self-label union member) may
  be added where the schema already declares an extension point.

The following are never allowed on a published schema:

- Removing a field.
- Changing a field's type, format, or constraints (narrowing *or*
  widening — even loosening a `maxLength` changes what old consumers
  validated against).
- Making an optional field required, or a required field optional.
- Renaming a field or a type.
- Repurposing a field name to mean something else.

This mirrors how AT Protocol lexicons are meant to evolve generally:
schemas are contracts that existing records and existing consumers
already depend on. A record published last year must still validate
against this year's schema.

## Breaking changes require a new NSID

If a genuinely incompatible change is needed — a field must change
meaning, a required field must be removed, a type must be redefined —
the answer is **never** to redefine the existing schema. The answer is
to mint a **new NSID** (e.g., a `v2` sibling type, or a differently named
type under the same `social.opencontent.*` namespace) and let both exist
side by side. Old records keep validating against the old schema forever;
new records opt in to the new schema by using the new type. Consumers
that don't understand the new NSID simply ignore records of that type
(same as any unknown collection — see the README's consumer rules).

This is the same discipline every stable protocol schema uses: additive
changes in place, breaking changes as a new identifier. It's what makes
the additive-only rule enforceable rather than aspirational — there is
never a "just this once" exception, because there's always a new-NSID
escape hatch instead.

## Standardization exit: how the BDFL role transfers

BDFL governance is a starting point, not a permanent commitment to one
person controlling the vocabulary indefinitely. If `social.opencontent.*`
becomes broadly relied upon and a successor body (a foundation, a working
group, a multi-steward org) is the right long-term home, the transfer
mechanism is intentionally simple and requires no protocol-level change:

1. Transfer the **`opencontent.social` domain registration** to the
   successor body.
2. Transfer the **steward AT Protocol account** (`@opencontent.social`,
   the account that hosts the canonical `com.atproto.lexicon.schema`
   records) to the successor body.

That's the entire hand-off. Because lexicon authority resolves via DNS
(the `_lexicon.opencontent.social` TXT record, see README) rather than
via this GitHub repository or any particular person's identity, whoever
controls the domain and the steward account controls where
`social.opencontent.*` schemas resolve to next. This repository
(`iserlabs/opencontent-lexicons`) would simply become — or hand off to —
whatever repository the successor body designates as source of truth.

**NSIDs never change** through this process. `social.opencontent.photograph`
is `social.opencontent.photograph` before, during, and after any
governance transfer. Existing records in every adopter's repo continue to
resolve and validate exactly as before; only the identity of who decides
the *next* additive change moves.
