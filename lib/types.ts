export const DATA_TYPES = [
  "none",
  "internal",
  "confidential",
  "restricted",
] as const;

export type DataType = (typeof DATA_TYPES)[number];
export type ReviewerGroup = "procurement" | "security";
export type RequestStatus =
  | "submitted"
  | "assessing"
  | "waiting_for_review"
  | "screened"
  | "approved"
  | "rejected"
  | "assessment_failed";

export type VendorRequestInput = {
  vendorName: string;
  businessPurpose: string;
  annualCost: number;
  dataTypes: DataType[];
};

export type PolicyRoute = {
  requiresHumanReview: boolean;
  reviewerGroups: ReviewerGroup[];
  reasons: string[];
  policyVersion: string;
};

export type VendorAssessment = {
  category: "productivity" | "development" | "data" | "security" | "other";
  suggestedRisk: "low" | "medium" | "high";
  missingInformation: string[];
  summary: string;
};

export type HumanDecision = {
  decision: "approved" | "rejected";
  reviewerSubject: string;
  reviewerEmail: string;
  reviewerGroups: string[];
  decidedAt: string;
};

export type VendorRequestRecord = VendorRequestInput & {
  id: string;
  requesterEmail: string;
  status: RequestStatus;
  policy: PolicyRoute | null;
  assessment: VendorAssessment | null;
  assessmentModel: string | null;
  assessmentVersion: string | null;
  workflowRunId: string | null;
  decision: HumanDecision | null;
  createdAt: string;
  updatedAt: string;
};

export type VerifiedPrincipal = {
  subject: string;
  email: string;
  groups: string[];
};
