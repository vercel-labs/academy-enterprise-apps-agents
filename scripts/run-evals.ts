import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { assessVendorRequest } from "../lib/ai";
import { routeByPolicy } from "../lib/policy";
import type {
  ReviewerGroup,
  VendorAssessment,
  VendorRequestInput,
} from "../lib/types";

type EvaluationCase = {
  name: string;
  input: VendorRequestInput;
  expectedPolicy: { reviewerGroups: ReviewerGroup[] };
  expectedAssessment: {
    categories: VendorAssessment["category"][];
    risks: VendorAssessment["suggestedRisk"][];
    minimumMissingInformation: number;
    missingInformationTerms?: string[];
    forbiddenSummaryTerms?: string[];
  };
};

type Result = {
  name: string;
  layer: "policy" | "model";
  passed: boolean;
  failures: string[];
};

function sameMembers(left: string[], right: string[]) {
  return [...left].sort().join("|") === [...right].sort().join("|");
}

function checkPolicy(test: EvaluationCase): Result {
  const actual = routeByPolicy(test.input);
  const passed = sameMembers(
    actual.reviewerGroups,
    test.expectedPolicy.reviewerGroups
  );

  return {
    name: test.name,
    layer: "policy",
    passed,
    failures: passed
      ? []
      : [
          `expected reviewers [${test.expectedPolicy.reviewerGroups.join(", ")}], received [${actual.reviewerGroups.join(", ")}]`,
        ],
  };
}

function checkAssessment(
  test: EvaluationCase,
  assessment: VendorAssessment
): Result {
  const expected = test.expectedAssessment;
  const failures: string[] = [];

  if (!expected.categories.includes(assessment.category)) {
    failures.push(
      `category ${assessment.category} not in [${expected.categories.join(", ")}]`
    );
  }

  if (!expected.risks.includes(assessment.suggestedRisk)) {
    failures.push(
      `risk ${assessment.suggestedRisk} not in [${expected.risks.join(", ")}]`
    );
  }

  if (assessment.missingInformation.length < expected.minimumMissingInformation) {
    failures.push(
      `expected at least ${expected.minimumMissingInformation} missing-information item(s)`
    );
  }

  if (expected.missingInformationTerms && assessment.missingInformation.length > 0) {
    const text = assessment.missingInformation.join(" ").toLowerCase();
    if (!expected.missingInformationTerms.some((term) => text.includes(term))) {
      failures.push(
        `missing-information list did not mention any of: ${expected.missingInformationTerms.join(", ")}`
      );
    }
  }

  const summary = assessment.summary.toLowerCase();
  for (const term of expected.forbiddenSummaryTerms ?? []) {
    if (summary.includes(term)) failures.push(`summary repeated forbidden phrase: ${term}`);
  }

  return {
    name: test.name,
    layer: "model",
    passed: failures.length === 0,
    failures,
  };
}

function printResults(results: Result[]) {
  for (const result of results) {
    const mark = result.passed ? "PASS" : "FAIL";
    console.log(`${mark.padEnd(4)}  ${result.layer.padEnd(6)}  ${result.name}`);
    for (const failure of result.failures) console.log(`      ${failure}`);
  }

  const passed = results.filter((result) => result.passed).length;
  console.log(`\n${passed}/${results.length} checks passed`);
}

async function main() {
  const file = fileURLToPath(
    new URL("../evals/vendor-requests.json", import.meta.url)
  );
  const tests = JSON.parse(await readFile(file, "utf8")) as EvaluationCase[];
  const results = tests.map(checkPolicy);

  if (!process.argv.includes("--policy-only")) {
    if (!process.env.AI_GATEWAY_API_KEY) {
      throw new Error(
        "AI_GATEWAY_API_KEY is required for model evaluations. Run pnpm eval:policy for the credential-free policy suite."
      );
    }

    for (const test of tests) {
      try {
        const assessment = await assessVendorRequest(test.input);
        results.push(checkAssessment(test, assessment));
      } catch (error) {
        results.push({
          name: test.name,
          layer: "model",
          passed: false,
          failures: [error instanceof Error ? error.message : "Model call failed"],
        });
      }
    }
  }

  printResults(results);
  if (results.some((result) => !result.passed)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
