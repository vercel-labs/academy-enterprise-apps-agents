# Enterprise Apps and Agents course project

This `main` branch is the stable starting point for the Vercel Academy course **Enterprise Apps and Agents**. It contains Vendor Review, a useful prototype that is intentionally incomplete:

- Requests and assessments are not persisted
- Model output is free text
- Deterministic company policy is not represented in code
- There is no durable human-review process
- There is no application lifecycle record

The finished reference lives on the [`complete`](https://github.com/vercel-labs/academy-enterprise-apps-agents/tree/complete) branch. Keep your course work on a separate branch so you can compare it with either state.

## Run the starter

Use Node.js 24 or later. The starter contains no hardcoded secret. Copy `.env.example` to `.env.local` and provide `AI_GATEWAY_API_KEY` through environment configuration.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Creating a comparable interface with v0 is optional. The course begins from the behavior in this branch, including the gaps listed above.
