import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type {
  HumanDecision,
  PolicyRoute,
  VendorAssessment,
  VendorRequestInput,
  VendorRequestRecord,
  VerifiedPrincipal,
} from "./types";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

type RequestRow = {
  id: string;
  requester_email: string;
  vendor_name: string;
  business_purpose: string;
  annual_cost: number;
  data_types: VendorRequestInput["dataTypes"];
  status: VendorRequestRecord["status"];
  policy: PolicyRoute | null;
  assessment: VendorAssessment | null;
  assessment_model: string | null;
  assessment_version: string | null;
  workflow_run_id: string | null;
  review_token?: string;
  decision: HumanDecision | null;
  created_at: string;
  updated_at: string;
};

function toRecord(row: RequestRow): VendorRequestRecord {
  return {
    id: row.id,
    requesterEmail: row.requester_email,
    vendorName: row.vendor_name,
    businessPurpose: row.business_purpose,
    annualCost: row.annual_cost,
    dataTypes: row.data_types,
    status: row.status,
    policy: row.policy,
    assessment: row.assessment,
    assessmentModel: row.assessment_model,
    assessmentVersion: row.assessment_version,
    workflowRunId: row.workflow_run_id,
    decision: row.decision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRequest(
  input: VendorRequestInput,
  idempotencyKey: string,
  principal: VerifiedPrincipal
): Promise<VendorRequestRecord> {
  const rows = await getSql()`
    INSERT INTO vendor_requests (
      id, requester_email, vendor_name, business_purpose, annual_cost,
      data_types, status, idempotency_key, review_token
    ) VALUES (
      ${randomUUID()}, ${principal.email}, ${input.vendorName},
      ${input.businessPurpose}, ${input.annualCost},
      ${JSON.stringify(input.dataTypes)}::jsonb, 'submitted',
      ${idempotencyKey}, ${randomUUID()}
    )
    ON CONFLICT (idempotency_key) DO UPDATE
      SET idempotency_key = EXCLUDED.idempotency_key
    RETURNING id, requester_email, vendor_name, business_purpose,
      annual_cost::float, data_types, status, policy, assessment,
      assessment_model, assessment_version, workflow_run_id, decision,
      created_at::text, updated_at::text
  `;

  return toRecord(rows[0] as RequestRow);
}

export async function listRequests(): Promise<VendorRequestRecord[]> {
  const rows = await getSql()`
    SELECT id, requester_email, vendor_name, business_purpose,
      annual_cost::float, data_types, status, policy, assessment,
      assessment_model, assessment_version, workflow_run_id, decision,
      created_at::text, updated_at::text
    FROM vendor_requests
    ORDER BY created_at DESC
  `;
  return (rows as RequestRow[]).map(toRecord);
}

export async function getRequest(id: string): Promise<VendorRequestRecord | null> {
  const rows = await getSql()`
    SELECT id, requester_email, vendor_name, business_purpose,
      annual_cost::float, data_types, status, policy, assessment,
      assessment_model, assessment_version, workflow_run_id, decision,
      created_at::text, updated_at::text
    FROM vendor_requests
    WHERE id = ${id}
  `;
  return rows[0] ? toRecord(rows[0] as RequestRow) : null;
}

export async function getWorkflowInput(id: string) {
  const rows = await getSql()`
    SELECT id, requester_email, vendor_name, business_purpose,
      annual_cost::float, data_types, status, policy, assessment,
      assessment_model, assessment_version, workflow_run_id, decision,
      created_at::text, updated_at::text, review_token
    FROM vendor_requests
    WHERE id = ${id}
  `;
  const row = rows[0] as RequestRow | undefined;
  return row ? { record: toRecord(row), reviewToken: row.review_token! } : null;
}

export async function claimWorkflowStart(id: string): Promise<boolean> {
  const rows = await getSql()`
    UPDATE vendor_requests
    SET workflow_run_id = 'starting', status = 'assessing', updated_at = NOW()
    WHERE id = ${id} AND workflow_run_id IS NULL
    RETURNING id
  `;
  return rows.length === 1;
}

export async function setWorkflowRunId(id: string, runId: string) {
  await getSql()`
    UPDATE vendor_requests
    SET workflow_run_id = ${runId}, updated_at = NOW()
    WHERE id = ${id} AND workflow_run_id = 'starting'
  `;
}

export async function releaseWorkflowClaim(id: string) {
  await getSql()`
    UPDATE vendor_requests
    SET workflow_run_id = NULL, status = 'submitted', updated_at = NOW()
    WHERE id = ${id} AND workflow_run_id = 'starting'
  `;
}

export async function saveAssessment(
  id: string,
  policy: PolicyRoute,
  assessment: VendorAssessment,
  model: string,
  assessmentVersion: string
) {
  const nextStatus = policy.requiresHumanReview ? "waiting_for_review" : "screened";
  await getSql()`
    UPDATE vendor_requests
    SET policy = ${JSON.stringify(policy)}::jsonb,
        assessment = ${JSON.stringify(assessment)}::jsonb,
        assessment_model = ${model},
        assessment_version = ${assessmentVersion},
        status = ${nextStatus},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function markAssessmentFailed(id: string) {
  await getSql()`
    UPDATE vendor_requests
    SET status = 'assessment_failed', updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function saveDecision(id: string, decision: HumanDecision) {
  await getSql()`
    UPDATE vendor_requests
    SET decision = ${JSON.stringify(decision)}::jsonb,
        status = ${decision.decision},
        updated_at = NOW()
    WHERE id = ${id} AND decision IS NULL
  `;
}
