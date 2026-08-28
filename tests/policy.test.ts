import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routeByPolicy } from "../lib/policy";
import type { VendorRequestInput } from "../lib/types";

function request(
  overrides: Partial<VendorRequestInput> = {}
): VendorRequestInput {
  return {
    vendorName: "Acme",
    businessPurpose: "Support the customer success team",
    annualCost: 10_000,
    dataTypes: ["internal"],
    ...overrides,
  };
}

describe("routeByPolicy", () => {
  it("routes the exact cost threshold to Procurement", () => {
    assert.deepEqual(routeByPolicy(request({ annualCost: 50_000 })).reviewerGroups, [
      "procurement",
    ]);
  });

  it("routes restricted data to Security", () => {
    assert.deepEqual(
      routeByPolicy(request({ dataTypes: ["restricted"] })).reviewerGroups,
      ["security"]
    );
  });

  it("keeps both routes when both rules match", () => {
    assert.deepEqual(
      routeByPolicy(
        request({ annualCost: 50_000, dataTypes: ["restricted"] })
      ).reviewerGroups,
      ["procurement", "security"]
    );
  });

  it("screens a request that matches neither rule", () => {
    const route = routeByPolicy(request());
    assert.equal(route.requiresHumanReview, false);
    assert.deepEqual(route.reviewerGroups, []);
  });
});
