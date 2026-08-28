import { generateText } from "ai";
import type { VendorRequestInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as VendorRequestInput;

  const result = await generateText({
    model: "openai/gpt-5.4-mini",
    instructions:
      "Assess an internal software-vendor request. Suggest low, medium, or high risk, identify missing information, and give a short explanation. Do not make a final approval decision.",
    prompt: `Vendor: ${input.vendorName}
Business purpose: ${input.businessPurpose}
Estimated annual cost: $${input.annualCost}
Company data involved: ${input.dataTypes.join(", ")}`,
  });

  return Response.json({ text: result.text });
}
