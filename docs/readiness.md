# Vendor Review readiness

This is the completed course reference. Replace example values with evidence from your own deployment.

## Prototype baseline

- Source: `vercel-labs/academy-enterprise-apps-agents`
- Production branch: `main`
- Finished implementation: `complete`
- Application owner: Procurement operations
- Technical owner: Internal applications team
- Protection: Vercel Authentication is the lab control. Passport remains planned for employee access.
- Prototype finding: an assessment disappears on refresh and cannot prove which model or person produced a decision.

## Application job

Help a small Procurement and Security review group identify incomplete or higher-risk software requests and route them to the right person.

The application collects a request, applies written cost and data rules, asks a model for a structured assessment, and preserves the human decision. It does not purchase software, sign contracts, provision accounts, or make final legal or security determinations.

- Business owner: Procurement operations
- Technical owner: Internal applications team
- First users: one employee test group plus Procurement and Security reviewers
- Baseline: measure requests returned for missing information before rollout
- Target: reduce incomplete requests during a four-week test
- Decision owner: Procurement operations lead

## Failure review

| Failure | First action | Missing evidence | Owner | Control and state |
|---|---|---|---|---|
| Builder leaves | Confirm team ownership and emergency shipper | Dated handoff result | Technical owner | Organizational source and project ownership, planned outside the lab |
| Reviewer cannot sign in | Keep test group on protected URLs | Employee group mapping | Identity owner | Vercel Authentication implemented for lab; Passport planned |
| Model calls restricted data low risk | Pause affected requests | Policy and assessment version | Application owner | Deterministic Security route implemented |
| Double submission | Inspect request and workflow IDs | Idempotency key | Technical owner | Idempotent create and single workflow claim implemented |
| Nobody knows whether it is used | Keep rollout small | Reporting period | Application owner | Operating report demonstrated in course |

## Builders and owners

- Source organization: learner fork for the lab; company organization required for rollout
- Vercel team: learner team for the lab
- Application owner: Procurement operations
- Technical owner: Internal applications team
- Deployers: developers assigned to the application project
- Transfer procedure: repository, Vercel project, environment settings, logs, and emergency access are reviewed with the receiving team
- Enterprise Managed Users and Directory Sync: planned unless verified in the learner's Enterprise environment

## Application users

| Group | Access |
|---|---|
| Employees | Submit and view their own requests |
| Procurement | Review requests routed to Procurement |
| Security | Review requests routed to Security |
| Platform team | Operate deployments without automatic business-review authority |

Vercel Authentication protects the lab. Passport with company identity groups is the planned employee-access control. Application authorization still checks reviewer groups for each decision.

The lab stores one final decision and requires its demo reviewer to have every group named by policy. A company process that requires separate Procurement and Security approvals needs one recorded decision from each group before the workflow completes.

## Systems the application can reach

| System | Purpose | Acting as | Permission | Environment | Revocation owner |
|---|---|---|---|---|---|
| Postgres | Store request and decision evidence | Application | Read and write Vendor Review tables | Preview and Production use separate data | Technical owner |
| AI Gateway | Produce structured assessment | Application | Approved assessment models only | Preview and Production | AI platform owner |
| Procurement system | Create a review record | Application | Create only | Production | Procurement IT |
| Slack | Notify reviewers | Application | Post to the approved destination | Production | Platform team |

The last two integrations are planned in this reference. Do not mark Connect implemented until a connector and its runtime access have been verified.

## Who decides what

| Deterministic policy | Model judgment | Human authority |
|---|---|---|
| Cost at or above $50,000 requires Procurement | Vendor category | Approve or reject vendor |
| Restricted data requires Security | Suggested risk | Sign contract or purchase |
| Required request fields | Missing information and summary | Grant exceptions to policy |

## Agent job

- Goal: gather one complete vendor request and submit it after the person approves the tool call
- Tool: `request_vendor_review`, limited to the Vendor Review request API
- State: current eve session and one stable tool-call ID
- Retry rule: derive the request idempotency key from the stable tool-call ID
- Stop: the person declines, declines a required field, or one request is submitted
- Approval: every submission tool call
- Outside its authority: approving, rejecting, purchasing, signing, provisioning, shell, filesystem, web, and self-delegation

## Rollout

The reference supports a protected course demonstration. A broader employee rollout remains blocked until organizational ownership, employee identity, row-level request access, operating evidence, and recovery ownership are implemented and verified.
