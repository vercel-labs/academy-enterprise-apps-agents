# Vendor Review model record

This file is the release record format. Policy results below come from the credential-free suite. Run live model evaluations in your own environment before recording a model result.

- AI task: identify missing information, classify vendor category, suggest risk, and summarize for a reviewer
- Assessment model: `openai/gpt-5.4-mini`
- Assessment version: `vendor-assessment-v1`
- Data sent: vendor name, business purpose, annual cost, and data types
- Production authentication: Vercel OIDC
- Local authentication: developer-owned AI Gateway key in `.env.local`
- Provider and model policy: configure in AI Gateway for the learner's team
- Retention and prompt-training policy: configure to match company requirements
- Budget owner and limit: must be supplied before rollout
- Blocked-request behavior: preserve the request and mark the assessment failed

## Evaluation record

- Deterministic policy: 12/12 checked-in cases expected to pass with `pnpm eval:policy`
- Fast tests: policy thresholds, identity adapters, reviewer authorization, repeated and conflicting decisions, and retry-key stability
- Live model result: run `pnpm eval` and record date, model, pass count, latency, and unresolved failures
- Release decision: no broader rollout on the strength of the repository alone
