import { markAssessmentFailed as markAssessmentFailedRecord } from "@/lib/db";

export async function markAssessmentFailed(requestId: string) {
  "use step";
  await markAssessmentFailedRecord(requestId);
}
