# Enterprise Apps and Agents course project

This tagged tree is the unfinished implementation scaffold for the Vercel Academy course **Enterprise Apps and Agents**. It provides the request UI, database and identity adapters, evaluation runner, and fast tests. The learner still implements:

- Structured model assessment in `lib/ai.ts`
- Deterministic routing in `lib/policy.ts`
- A durable review in `workflows/process-vendor-request.ts`
- One additional evaluation case
- The eve intake agent copied later from `agent-start`

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

The templates in `docs/` belong to the learner's deployment. Completed reference
answers live on `complete`.

## Identity boundary

`ALLOW_DEMO_IDENTITY=true` enables request headers supplied by the demo UI and displays a warning. It exists only so the course can exercise authorization locally.

A real deployment must disable it and connect `getVerifiedPrincipal()` to trusted identity context. The application must also add row-level authorization before serving requests to a broader employee population.
