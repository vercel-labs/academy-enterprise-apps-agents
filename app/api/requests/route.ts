import { start } from "workflow/api";
import { z } from "zod";
import { getVerifiedPrincipal } from "@/lib/auth";
import {
  claimWorkflowStart,
  createRequest,
  listRequests,
  releaseWorkflowClaim,
  setWorkflowRunId,
} from "@/lib/db";
import { DATA_TYPES } from "@/lib/types";
import { processVendorRequest } from "@/workflows/process-vendor-request";

const requestSchema = z.object({
  vendorName: z.string().min(1).max(120),
  businessPurpose: z.string().min(10).max(2000),
  annualCost: z.number().nonnegative().max(100_000_000),
  dataTypes: z.array(z.enum(DATA_TYPES)).min(1),
  idempotencyKey: z.string().uuid(),
});

export async function GET() {
  return Response.json(await listRequests());
}

export async function POST(request: Request) {
  try {
    const principal = getVerifiedPrincipal(request);
    const input = requestSchema.parse(await request.json());
    const record = await createRequest(input, input.idempotencyKey, principal);

    if (await claimWorkflowStart(record.id)) {
      try {
        const run = await start(processVendorRequest, [record.id]);
        await setWorkflowRunId(record.id, run.runId);
      } catch (error) {
        await releaseWorkflowClaim(record.id);
        throw error;
      }
    }

    return Response.json(record, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return Response.json({ error: message }, { status: 400 });
  }
}
