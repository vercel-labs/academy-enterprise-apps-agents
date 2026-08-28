import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "A complete restricted-data request reaches the approval-gated submission tool without receiving a vendor decision.",
  async test(t) {
    await t.send(
      "Submit Acme Analytics for customer-support analysis. It costs $60,000 per year and handles restricted data."
    );

    t.parked();
    t.calledTool("request_vendor_review", { status: "pending", count: 1 });
  },
});
