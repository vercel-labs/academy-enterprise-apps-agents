import { ASSESSMENT_MODEL, ASSESSMENT_VERSION, assessVendorRequest } from "@/lib/ai";
import { routeByPolicy } from "@/lib/policy";
import type { VendorRequestInput } from "@/lib/types";

export async function assessRequest(request: VendorRequestInput) {
  "use step";

  const policy = routeByPolicy(request);
  const assessment = await assessVendorRequest(request);

  return {
    policy,
    assessment,
    model: ASSESSMENT_MODEL,
    assessmentVersion: ASSESSMENT_VERSION,
  };
}
