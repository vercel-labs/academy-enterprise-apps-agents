import { resumeHook } from "workflow/api";
import { z } from "zod";
import { getVerifiedPrincipal } from "@/lib/auth";
import { getWorkflowInput } from "@/lib/db";
import type { HumanDecision } from "@/lib/types";

const decisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export async function POST(request: Request) {
  try {
    const principal = getVerifiedPrincipal(request);
    const input = decisionSchema.parse(await request.json());
    const pending = await getWorkflowInput(input.requestId);

    if (!pending) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    if (pending.record.decision) {
      if (pending.record.decision.decision === input.decision) {
        return Response.json({ ok: true, decision: pending.record.decision });
      }
      return Response.json({ error: "Request already has a different decision" }, { status: 409 });
    }

    if (pending.record.status !== "waiting_for_review" || !pending.record.policy) {
      return Response.json({ error: "Request is not waiting for review" }, { status: 409 });
    }

    const allowed = pending.record.policy.reviewerGroups.every((group) =>
      principal.groups.includes(group)
    );
    if (!allowed) {
      return Response.json({ error: "Reviewer is not authorized" }, { status: 403 });
    }

    const decision: HumanDecision = {
      decision: input.decision,
      reviewerSubject: principal.subject,
      reviewerEmail: principal.email,
      reviewerGroups: principal.groups,
      decidedAt: new Date().toISOString(),
    };

    await resumeHook(pending.reviewToken, decision);
    return Response.json({ ok: true, decision }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid decision";
    return Response.json({ error: message }, { status: 400 });
  }
}
