import { getWorkflowInput } from "@/lib/db";

export async function loadRequest(requestId: string) {
  "use step";

  const request = await getWorkflowInput(requestId);
  if (!request) throw new Error(`Vendor request ${requestId} was not found`);
  return request;
}
