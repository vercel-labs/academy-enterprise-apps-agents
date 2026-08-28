import type { PolicyRoute, ReviewerGroup, VendorRequestInput } from "./types";

export const POLICY_VERSION = "vendor-routing-v1";

export function routeByPolicy(request: VendorRequestInput): PolicyRoute {
  void request;
  return {
    requiresHumanReview: false,
    reviewerGroups: [],
    reasons: [],
    policyVersion: POLICY_VERSION,
  };
}
