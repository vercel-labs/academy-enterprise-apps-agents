import { generateText, Output } from "ai";
import { z } from "zod";
import type { VendorAssessment, VendorRequestInput } from "./types";

export const ASSESSMENT_MODEL = "openai/gpt-5.4-mini";
export const ASSESSMENT_VERSION = "vendor-assessment-v1";

export const assessmentSchema = z.object({
  category: z.enum(["productivity", "development", "data", "security", "other"]),
  suggestedRisk: z.enum(["low", "medium", "high"]),
  missingInformation: z.array(z.string()).max(5),
  summary: z.string().min(1).max(600),
});

export async function assessVendorRequest(
  request: VendorRequestInput
): Promise<VendorAssessment> {
  void request;
  void generateText;
  void Output;
  throw new Error("Implement the structured assessment in lesson 3.1");
}
