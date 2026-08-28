# Vendor Review operating report

The repository cannot manufacture operating evidence. Replace the fields below with results from a dated test or rollout period.

## Reporting period

- Dates: not measured in the repository
- Requests submitted: record from persisted requests
- Requests completed: record from final decisions and screened requests
- Median and p90 decision time: calculate from created and updated timestamps
- Assessment failures: record from `assessment_failed`
- Workflow failures: record from Workflow runs
- Evaluation pass rate: record from the release evaluation
- AI cost per completed request: calculate from AI Gateway usage and completed requests
- Budget and owner: required before rollout
- Known gaps and owner: copy only unresolved items from `docs/readiness.md`

## Recovery

1. Stop new submissions or narrow the test group.
2. Disable the affected model, connector, or reviewer path when credentials or authority are involved.
3. Preserve request, workflow, and decision records.
4. Restore the previous known-good deployment with Instant Rollback or `vercel rollback`.
5. Inspect waiting and failed workflow runs. Decide which should resume, retry, or remain paused.
6. Recover database writes and external actions separately; a deployment rollback does not reverse them.
7. Fix and verify the cause in a protected preview before restoring normal production assignment.

## Rollout decision

- Broaden when: the business target is met and every required ownership, identity, authorization, reliability, recovery, and budget control is implemented
- Continue the small test when: the path works but operating evidence or a required rollout control remains incomplete
- Retire when: the target is not met, the owner cannot support the application, or required access and recovery controls are unjustified
- Decision owner: Procurement operations lead
- Reference decision: continue a protected small test; the repository demonstrates the path but does not prove a company deployment is ready
