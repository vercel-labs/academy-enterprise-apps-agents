CREATE TABLE IF NOT EXISTS vendor_requests (
  id                  TEXT PRIMARY KEY,
  requester_email     TEXT NOT NULL,
  vendor_name         TEXT NOT NULL,
  business_purpose    TEXT NOT NULL,
  annual_cost         NUMERIC(12, 2) NOT NULL CHECK (annual_cost >= 0),
  data_types          JSONB NOT NULL,
  status              TEXT NOT NULL CHECK (status IN (
                        'submitted', 'assessing', 'waiting_for_review',
                        'screened', 'approved', 'rejected', 'assessment_failed'
                      )),
  policy              JSONB,
  assessment          JSONB,
  assessment_model    TEXT,
  assessment_version  TEXT,
  workflow_run_id     TEXT,
  review_token        TEXT NOT NULL UNIQUE,
  idempotency_key     TEXT NOT NULL UNIQUE,
  decision            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vendor_requests_status_idx
  ON vendor_requests (status);
