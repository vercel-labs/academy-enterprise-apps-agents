import { resumeHook } from "workflow/api";
import { z } from "zod";
import { getVerifiedPrincipal } from "@/lib/auth";
import { getWorkflowInput } from "@/lib/db";
import { evaluateDecisionAttempt } from "@/lib/decision";
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

    if (!pending.record.policy) {
      return Response.json({ error: "Request is not waiting for review" }, { status: 409 });
    }

    const gate = evaluateDecisionAttempt({
      status: pending.record.status,
      existingDecision: pending.record.decision,
      requestedDecision: input.decision,
      requiredGroups: pending.record.policy.reviewerGroups,
      principalGroups: principal.groups,
    });

    if (gate.outcome === "duplicate") {
      return Response.json({ ok: true, decision: gate.decision });
    }
    if (gate.outcome === "conflict") {
      return Response.json(
        { error: "Request already has a different decision" },
        { status: 409 }
      );
    }
    if (gate.outcome === "not_waiting") {
      return Response.json(
        { error: "Request is not waiting for review" },
        { status: 409 }
      );
    }
    if (gate.outcome === "unauthorized") {
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
