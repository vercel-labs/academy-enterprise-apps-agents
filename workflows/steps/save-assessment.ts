import { saveAssessment as saveAssessmentRecord } from "@/lib/db";
import type { PolicyRoute, VendorAssessment } from "@/lib/types";

export async function saveAssessment(
  requestId: string,
  policy: PolicyRoute,
  assessment: VendorAssessment,
  model: string,
  assessmentVersion: string
) {
  "use step";
  await saveAssessmentRecord(requestId, policy, assessment, model, assessmentVersion);
}
