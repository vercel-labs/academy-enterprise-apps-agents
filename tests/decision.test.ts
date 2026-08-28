import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDecisionAttempt } from "../lib/decision";
import type { HumanDecision } from "../lib/types";

const existingDecision: HumanDecision = {
  decision: "approved",
  reviewerSubject: "directory:123",
  reviewerEmail: "reviewer@example.com",
  reviewerGroups: ["procurement", "security"],
  decidedAt: "2026-08-27T12:00:00.000Z",
};

describe("evaluateDecisionAttempt", () => {
  it("allows a reviewer with every required group", () => {
    assert.deepEqual(
      evaluateDecisionAttempt({
        status: "waiting_for_review",
        existingDecision: null,
        requestedDecision: "approved",
        requiredGroups: ["procurement", "security"],
        principalGroups: ["employee", "security", "procurement"],
      }),
      { outcome: "allowed" }
    );
  });

  it("denies a reviewer missing one required group", () => {
    assert.deepEqual(
      evaluateDecisionAttempt({
        status: "waiting_for_review",
        existingDecision: null,
        requestedDecision: "approved",
        requiredGroups: ["procurement", "security"],
        principalGroups: ["procurement"],
      }),
      { outcome: "unauthorized" }
    );
  });

  it("returns the existing result for the same repeated decision", () => {
    const result = evaluateDecisionAttempt({
      status: "approved",
      existingDecision,
      requestedDecision: "approved",
      requiredGroups: ["procurement", "security"],
      principalGroups: ["procurement", "security"],
    });
    assert.equal(result.outcome, "duplicate");
  });

  it("rejects a conflicting second decision", () => {
    assert.deepEqual(
      evaluateDecisionAttempt({
        status: "approved",
        existingDecision,
        requestedDecision: "rejected",
        requiredGroups: ["procurement", "security"],
        principalGroups: ["procurement", "security"],
      }),
      { outcome: "conflict" }
    );
  });

  it("rejects a decision before the workflow is waiting", () => {
    assert.deepEqual(
      evaluateDecisionAttempt({
        status: "assessing",
        existingDecision: null,
        requestedDecision: "approved",
        requiredGroups: ["procurement"],
        principalGroups: ["procurement"],
      }),
      { outcome: "not_waiting" }
    );
  });
});
