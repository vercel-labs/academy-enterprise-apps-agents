import type { HumanDecision, RequestStatus, ReviewerGroup } from "./types";

type DecisionAttempt = {
  status: RequestStatus;
  existingDecision: HumanDecision | null;
  requestedDecision: HumanDecision["decision"];
  requiredGroups: ReviewerGroup[];
  principalGroups: string[];
};

export type DecisionGate =
  | { outcome: "allowed" }
  | { outcome: "duplicate"; decision: HumanDecision }
  | { outcome: "conflict" }
  | { outcome: "not_waiting" }
  | { outcome: "unauthorized" };

export function evaluateDecisionAttempt({
  status,
  existingDecision,
  requestedDecision,
  requiredGroups,
  principalGroups,
}: DecisionAttempt): DecisionGate {
  if (existingDecision) {
    return existingDecision.decision === requestedDecision
      ? { outcome: "duplicate", decision: existingDecision }
      : { outcome: "conflict" };
  }

  if (status !== "waiting_for_review") return { outcome: "not_waiting" };

  const authorized = requiredGroups.every((group) =>
    principalGroups.includes(group)
  );
  return authorized ? { outcome: "allowed" } : { outcome: "unauthorized" };
}
