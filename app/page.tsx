"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { DataType, VendorRequestRecord } from "@/lib/types";

const dataOptions: DataType[] = [
  "none",
  "internal",
  "confidential",
  "restricted",
];

const statusStyles: Record<VendorRequestRecord["status"], string> = {
  submitted: "bg-gray-100 text-gray-700",
  assessing: "bg-blue-100 text-blue-800",
  waiting_for_review: "bg-amber-100 text-amber-900",
  screened: "bg-emerald-100 text-emerald-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  assessment_failed: "bg-red-100 text-red-800",
};

function identityHeaders(): Record<string, string> {
  if (process.env.NEXT_PUBLIC_DEMO_IDENTITY !== "true") return {};
  return {
    "x-demo-user-email": "reviewer@example.com",
    "x-demo-user-groups": "procurement,security",
  };
}

export default function Home() {
  const [requests, setRequests] = useState<VendorRequestRecord[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [annualCost, setAnnualCost] = useState("");
  const [dataTypes, setDataTypes] = useState<DataType[]>(["none"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/requests", { cache: "no-store" });
    if (response.ok) setRequests(await response.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function toggleDataType(value: DataType) {
    if (value === "none") {
      setDataTypes(["none"]);
      return;
    }
    setDataTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current.filter((item) => item !== "none"), value]
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...identityHeaders() },
      body: JSON.stringify({
        vendorName,
        businessPurpose,
        annualCost: Number(annualCost),
        dataTypes,
        idempotencyKey: crypto.randomUUID(),
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Request failed");
    } else {
      setVendorName("");
      setBusinessPurpose("");
      setAnnualCost("");
      setDataTypes(["none"]);
      await refresh();
    }
    setBusy(false);
  }

  async function decide(requestId: string, decision: "approved" | "rejected") {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...identityHeaders() },
      body: JSON.stringify({ requestId, decision }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Decision failed");
    }
    await refresh();
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      {process.env.NEXT_PUBLIC_DEMO_IDENTITY === "true" && (
        <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Demo identity is enabled. Requests act as reviewer@example.com with
          Procurement and Security roles. Do not enable this adapter in a real deployment.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">Internal tools</p>
          <h1 className="mt-1 text-3xl font-semibold">Vendor Review</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Collect a software-vendor request, apply written routing policy,
            and preserve the model assessment and human decision separately.
          </p>
        </div>
        <button onClick={refresh} className="rounded border px-3 py-2 text-sm">
          Refresh
        </button>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border p-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Vendor name</span>
          <input
            required
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Estimated annual cost (USD)</span>
          <input
            required
            min="0"
            type="number"
            value={annualCost}
            onChange={(event) => setAnnualCost(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Business purpose</span>
          <textarea
            required
            minLength={10}
            value={businessPurpose}
            onChange={(event) => setBusinessPurpose(event.target.value)}
            className="mt-1 min-h-24 w-full rounded border px-3 py-2"
          />
        </label>
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Company data involved</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {dataOptions.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dataTypes.includes(value)}
                  onChange={() => toggleDataType(value)}
                />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          disabled={busy}
          className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Submit request
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Requests</h2>
        {requests.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
        {requests.map((request) => (
          <article key={request.id} className="rounded-lg border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{request.vendorName}</h3>
                <p className="text-sm text-gray-600">{request.businessPurpose}</p>
                <p className="mt-1 text-xs text-gray-500">
                  ${request.annualCost.toLocaleString()} annually · {request.dataTypes.join(", ")}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[request.status]}`}>
                {request.status.replaceAll("_", " ")}
              </span>
            </div>

            {request.policy && (
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium">Policy route</p>
                  <p className="text-gray-600">
                    {request.policy.reasons.length > 0
                      ? request.policy.reasons.join("; ")
                      : "No mandatory reviewer triggered"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Model assessment</p>
                  <p className="text-gray-600">{request.assessment?.summary}</p>
                </div>
              </div>
            )}

            {request.status === "waiting_for_review" && (
              <div className="mt-4 flex gap-2">
                <button
                  disabled={busy}
                  onClick={() => decide(request.id, "approved")}
                  className="rounded bg-green-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busy}
                  onClick={() => decide(request.id, "rejected")}
                  className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {request.decision && (
              <p className="mt-4 text-xs text-gray-500">
                {request.decision.decision} by {request.decision.reviewerEmail} at {request.decision.decidedAt}
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
