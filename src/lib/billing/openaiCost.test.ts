import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMessageCostMicros, estimateMessageCostMicros } from './openaiCost';

test('estimateMessageCostMicros uses configured env pricing', () => {
  process.env.OPENAI_COST_INPUT_PER_1M_USD = '10';
  process.env.OPENAI_COST_OUTPUT_PER_1M_USD = '20';
  process.env.OPENAI_USD_TO_EUR = '1';
  process.env.OPENAI_ESTIMATED_PROMPT_TOKENS = '1000';
  process.env.OPENAI_ESTIMATED_COMPLETION_TOKENS = '500';

  // (1000/1e6*10 + 500/1e6*20) = 0.02 EUR
  assert.equal(estimateMessageCostMicros(), 20_000);
});

test('calculateMessageCostMicros calculates actual usage cost', () => {
  process.env.OPENAI_COST_INPUT_PER_1M_USD = '10';
  process.env.OPENAI_COST_OUTPUT_PER_1M_USD = '30';
  process.env.OPENAI_USD_TO_EUR = '1';

  // input 2000 => 0.02, output 1000 => 0.03, total 0.05 EUR
  assert.equal(
    calculateMessageCostMicros({
      promptTokens: 2000,
      completionTokens: 1000,
    }),
    50_000
  );
});
