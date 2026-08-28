import { createHook } from "workflow";
import type { HumanDecision } from "@/lib/types";
import { assessRequest } from "./steps/assess-request";
import { loadRequest } from "./steps/load-request";
import { markAssessmentFailed } from "./steps/mark-assessment-failed";
import { saveAssessment } from "./steps/save-assessment";
import { saveDecision } from "./steps/save-decision";

export async function processVendorRequest(requestId: string) {
  "use workflow";
  void requestId;
  throw new Error("Implement the durable review in lesson 3.4");
}
