import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getVerifiedPrincipal } from "../lib/auth";

const identityKeys = [
  "ALLOW_DEMO_IDENTITY",
  "VERIFIED_USER_EMAIL_HEADER",
  "VERIFIED_USER_SUBJECT_HEADER",
  "VERIFIED_USER_GROUPS_HEADER",
] as const;

const originalEnvironment = Object.fromEntries(
  identityKeys.map((key) => [key, process.env[key]])
);

afterEach(() => {
  for (const key of identityKeys) {
    const value = originalEnvironment[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("getVerifiedPrincipal", () => {
  it("rejects identity headers when no trusted adapter is configured", () => {
    for (const key of identityKeys) delete process.env[key];
    const request = new Request("https://example.com", {
      headers: { "x-demo-user-email": "employee@example.com" },
    });

    assert.throws(
      () => getVerifiedPrincipal(request),
      /Verified identity adapter is not configured/
    );
  });

  it("uses demo headers only after the development flag is enabled", () => {
    process.env.ALLOW_DEMO_IDENTITY = "true";
    const principal = getVerifiedPrincipal(
      new Request("https://example.com", {
        headers: {
          "x-demo-user-email": "employee@example.com",
          "x-demo-user-groups": "employee, procurement",
        },
      })
    );

    assert.deepEqual(principal, {
      subject: "demo:employee@example.com",
      email: "employee@example.com",
      groups: ["employee", "procurement"],
    });
  });

  it("reads identity from the configured trusted headers", () => {
    delete process.env.ALLOW_DEMO_IDENTITY;
    process.env.VERIFIED_USER_EMAIL_HEADER = "x-verified-email";
    process.env.VERIFIED_USER_SUBJECT_HEADER = "x-verified-subject";
    process.env.VERIFIED_USER_GROUPS_HEADER = "x-verified-groups";

    const principal = getVerifiedPrincipal(
      new Request("https://example.com", {
        headers: {
          "x-verified-email": "reviewer@example.com",
          "x-verified-subject": "directory:123",
          "x-verified-groups": "security, procurement",
        },
      })
    );

    assert.deepEqual(principal, {
      subject: "directory:123",
      email: "reviewer@example.com",
      groups: ["security", "procurement"],
    });
  });
});
