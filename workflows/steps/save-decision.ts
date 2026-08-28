import { saveDecision as saveDecisionRecord } from "@/lib/db";
import type { HumanDecision } from "@/lib/types";

export async function saveDecision(requestId: string, decision: HumanDecision) {
  "use step";
  await saveDecisionRecord(requestId, decision);
}
