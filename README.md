# Enterprise Apps and Agents course project

This branch contains the governed Vendor Review reference application before the intake-agent exercise. It demonstrates:

- Deterministic cost and data-routing policy
- Structured model assessment through AI Gateway
- Separate persisted policy, model, and human evidence
- Idempotent request creation
- A durable Workflow SDK review process
- A development-only identity adapter that is visibly unsafe for real deployment

The `agent-start` tag marks this exact checkpoint. The `complete` branch adds the bounded Eve intake agent.

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

## Identity boundary

`ALLOW_DEMO_IDENTITY=true` enables request headers supplied by the demo UI and displays a warning. It exists only so the course can exercise authorization locally.

A real deployment must disable it and connect `getVerifiedPrincipal()` to trusted identity context. The application must also add row-level authorization before serving requests to a broader employee population.
