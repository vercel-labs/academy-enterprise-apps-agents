import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.4",
  reasoning: "low",
  limits: {
    maxInputTokensPerSession: 20_000,
    maxOutputTokensPerSession: 4_000,
    sessionTimeoutMs: 24 * 60 * 60 * 1_000,
  },
});
