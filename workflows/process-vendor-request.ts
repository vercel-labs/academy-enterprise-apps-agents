import { createHook } from "workflow";
import type { HumanDecision } from "@/lib/types";
import { assessRequest } from "./steps/assess-request";
import { loadRequest } from "./steps/load-request";
import { markAssessmentFailed } from "./steps/mark-assessment-failed";
import { saveAssessment } from "./steps/save-assessment";
import { saveDecision } from "./steps/save-decision";

export async function processVendorRequest(requestId: string) {
  "use workflow";

  const { record, reviewToken } = await loadRequest(requestId);
  let result;
  try {
    result = await assessRequest(record);
  } catch (error) {
    await markAssessmentFailed(requestId);
    throw error;
  }

  await saveAssessment(
    requestId,
    result.policy,
    result.assessment,
    result.model,
    result.assessmentVersion
  );

  if (!result.policy.requiresHumanReview) {
    return { requestId, status: "screened" as const };
  }

  using reviewHook = createHook<HumanDecision>({ token: reviewToken });
  const decision = await reviewHook;
  await saveDecision(requestId, decision);

  return { requestId, status: decision.decision };
}
