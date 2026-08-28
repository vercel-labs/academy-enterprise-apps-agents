import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { idempotencyKeyForToolCall } from "../lib/idempotency";

describe("idempotencyKeyForToolCall", () => {
  it("returns the same UUID-shaped key for one retried tool call", () => {
    const first = idempotencyKeyForToolCall("tool-call-123");
    const retry = idempotencyKeyForToolCall("tool-call-123");
    assert.equal(first, retry);
    assert.match(
      first,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("changes when the tool call changes", () => {
    assert.notEqual(
      idempotencyKeyForToolCall("tool-call-123"),
      idempotencyKeyForToolCall("tool-call-456")
    );
  });
});
