import { createHash } from "node:crypto";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { routeByPolicy } from "../../lib/policy";
import { DATA_TYPES } from "../../lib/types";

const responseSchema = z.object({
  id: z.string(),
  status: z.string(),
});

function idempotencyKey(callId: string) {
  const hex = createHash("sha256").update(callId).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export default defineTool({
  description:
    "Submit one information-complete vendor request. This creates a request and may start a durable review workflow. It never approves or purchases a vendor.",
  inputSchema: z.object({
    vendorName: z.string().min(1).max(120),
    businessPurpose: z.string().min(10).max(2_000),
    annualCost: z.number().nonnegative().max(100_000_000),
    dataTypes: z.array(z.enum(DATA_TYPES)).min(1),
  }),
  async execute() {
    throw new Error(
      "Complete the approval gate and Vendor Review request submission"
    );
  },
});
