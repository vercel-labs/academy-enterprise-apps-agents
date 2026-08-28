"use client";

import { FormEvent, useState } from "react";
import type { DataType, PrototypeAssessment } from "@/lib/types";

const dataOptions: DataType[] = [
  "none",
  "internal",
  "confidential",
  "restricted",
];

export default function Home() {
  const [vendorName, setVendorName] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [annualCost, setAnnualCost] = useState("");
  const [dataTypes, setDataTypes] = useState<DataType[]>(["none"]);
  const [assessment, setAssessment] = useState<PrototypeAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setAssessment(null);

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName,
          businessPurpose,
          annualCost: Number(annualCost),
          dataTypes,
        }),
      });

      if (!response.ok) throw new Error("Assessment failed");
      setAssessment(await response.json());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Assessment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <p className="text-sm font-medium text-blue-700">Internal tools</p>
      <h1 className="mt-1 text-3xl font-semibold">Vendor Review</h1>
      <p className="mt-2 text-gray-600">
        Submit a proposed software vendor for an initial assessment. Procurement
        or Security makes the final decision.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-lg border p-6">
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
          <span className="text-sm font-medium">Business purpose</span>
          <textarea
            required
            value={businessPurpose}
            onChange={(event) => setBusinessPurpose(event.target.value)}
            className="mt-1 min-h-24 w-full rounded border px-3 py-2"
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

        <fieldset>
          <legend className="text-sm font-medium">Company data involved</legend>
          <div className="mt-2 flex flex-wrap gap-3">
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
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Assessing…" : "Run initial assessment"}
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-red-700">{error}</p>}
      {assessment && (
        <section className="mt-6 rounded-lg bg-gray-50 p-5">
          <h2 className="font-medium">Model assessment</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {assessment.text}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            This prototype does not store the request or make a final decision.
          </p>
        </section>
      )}
    </main>
  );
}
