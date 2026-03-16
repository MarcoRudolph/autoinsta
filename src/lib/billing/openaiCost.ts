type Usage = {
  promptTokens: number;
  completionTokens: number;
};

function parseEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export function getOpenAiCostConfig() {
  return {
    inputPer1MTokensUsd: parseEnvNumber('OPENAI_COST_INPUT_PER_1M_USD', 0),
    outputPer1MTokensUsd: parseEnvNumber('OPENAI_COST_OUTPUT_PER_1M_USD', 0),
    usdToEur: parseEnvNumber('OPENAI_USD_TO_EUR', 0.92),
    estimatedPromptTokens: parseEnvNumber('OPENAI_ESTIMATED_PROMPT_TOKENS', 1200),
    estimatedCompletionTokens: parseEnvNumber('OPENAI_ESTIMATED_COMPLETION_TOKENS', 250),
  };
}

export function estimateMessageCostMicros(): number {
  const cfg = getOpenAiCostConfig();
  const usd =
    (cfg.estimatedPromptTokens / 1_000_000) * cfg.inputPer1MTokensUsd +
    (cfg.estimatedCompletionTokens / 1_000_000) * cfg.outputPer1MTokensUsd;
  const eur = usd * cfg.usdToEur;
  return Math.max(0, Math.round(eur * 1_000_000));
}

export function calculateMessageCostMicros(usage: Usage): number {
  const cfg = getOpenAiCostConfig();
  const usd =
    (usage.promptTokens / 1_000_000) * cfg.inputPer1MTokensUsd +
    (usage.completionTokens / 1_000_000) * cfg.outputPer1MTokensUsd;
  const eur = usd * cfg.usdToEur;
  return Math.max(0, Math.round(eur * 1_000_000));
}
