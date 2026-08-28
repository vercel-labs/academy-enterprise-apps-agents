# Enterprise Apps and Agents course project

This `complete` branch is the canonical implementation for the Vercel Academy course **Enterprise Apps and Agents**. It demonstrates:

- Deterministic cost and data-routing policy
- Structured model assessment through AI Gateway
- Separate persisted policy, model, and human evidence
- Idempotent request creation
- A durable Workflow SDK review process
- An eve intake agent with one approval-gated tool and explicit stop conditions
- A development-only identity adapter that is visibly unsafe for real deployment

It does not claim to configure enterprise identity, Connect, Secure Compute, or BYOC. The course teaches those as demonstrated, planned, conditional, or not applicable controls depending on the learner's environment.

## Run locally

1. Create a Neon database and run `scripts/schema.sql`.
2. Copy `.env.example` to `.env.local` and add the required database and local model credentials.
3. Install dependencies and start the app.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`pnpm workflow:web` opens the local workflow dashboard.

## Run the eve agent

Keep `pnpm dev` running, then open a second terminal:

```bash
pnpm dev:agent
```

The agent gathers the four required request fields. Its only authored tool submits the request to Vendor Review, requires approval on every call, derives a replay-stable idempotency key, and returns the deterministic reviewer route. Shell, filesystem, web, and self-delegation tools are disabled.

Inspect the compiled capability surface with `pnpm agent:info`. Run the approval-boundary eval with:

```bash
pnpm eval:agent request-review-pauses
```

## Evaluation lab

The checked-in case set covers ordinary requests, exact policy boundaries,
ambiguous purposes, and prompt-injection attempts.

```bash
pnpm eval:policy  # 12 deterministic checks; no credentials required
pnpm eval         # policy checks plus live model assessments
```

The live suite requires `AI_GATEWAY_API_KEY`. Model expectations allow bounded
variation while still enforcing category/risk ranges, missing-information
coverage, and forbidden injected language.

Fast tests cover exact routing thresholds, identity adapters, reviewer
authorization, repeated and conflicting decisions, and retry-key stability:

```bash
pnpm test
```

The completed course records live in `docs/`. They are honest reference answers,
not claims about a learner's deployment.

## Identity boundary

`ALLOW_DEMO_IDENTITY=true` enables request headers supplied by the demo UI and displays a warning. It exists only so the course can exercise authorization locally.

A real deployment must disable it and connect `getVerifiedPrincipal()` to trusted identity context. The application must also add row-level authorization before serving requests to a broader employee population.
