import type { PolicyRoute, ReviewerGroup, VendorRequestInput } from "./types";

export const POLICY_VERSION = "vendor-routing-v1";

export function routeByPolicy(request: VendorRequestInput): PolicyRoute {
  const reviewers = new Set<ReviewerGroup>();
  const reasons: string[] = [];

  if (request.annualCost >= 50_000) {
    reviewers.add("procurement");
    reasons.push("Annual cost is at least $50,000");
  }

  if (request.dataTypes.includes("restricted")) {
    reviewers.add("security");
    reasons.push("Vendor will handle restricted company data");
  }

  return {
    requiresHumanReview: reviewers.size > 0,
    reviewerGroups: [...reviewers],
    reasons,
    policyVersion: POLICY_VERSION,
  };
}
