import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BILLING_PLAN_CONFIG,
  canSendWithCredits,
  clampPersonaReplyText,
  creditsFromCostMicros,
  getPersonaReplyMaxChars,
  maxCompletionTokensForPersonaReply,
  microsFromCredits,
  normalizePlan,
} from './plans';

test('pro and max monthly credit budgets are configured as expected', () => {
  assert.equal(BILLING_PLAN_CONFIG.pro.monthlyCredits, 5000);
  assert.equal(BILLING_PLAN_CONFIG.max.monthlyCredits, 120000);
});

test('credits and micros conversion is consistent', () => {
  assert.equal(microsFromCredits(5000), 5_000_000);
  assert.equal(creditsFromCostMicros(5_000_000), 5000);
  assert.equal(creditsFromCostMicros(1), 1);
  assert.equal(creditsFromCostMicros(0), 0);
});

test('plan normalization defaults unknown plans to free', () => {
  assert.equal(normalizePlan('max'), 'max');
  assert.equal(normalizePlan('pro'), 'pro');
  assert.equal(normalizePlan('enterprise'), 'enterprise');
  assert.equal(normalizePlan('unknown'), 'free');
  assert.equal(normalizePlan(undefined), 'free');
});

test('credit guard helper allows and blocks correctly', () => {
  assert.equal(canSendWithCredits(30, 30), true);
  assert.equal(canSendWithCredits(29, 30), false);
});

test('persona reply character limits by billing plan', () => {
  assert.equal(getPersonaReplyMaxChars('free'), 100);
  assert.equal(getPersonaReplyMaxChars('pro'), 250);
  assert.equal(getPersonaReplyMaxChars('max'), 500);
  assert.equal(getPersonaReplyMaxChars('enterprise'), 500);
});

test('clampPersonaReplyText respects max length and prefers word breaks', () => {
  assert.equal(clampPersonaReplyText('hi', 100), 'hi');
  assert.equal(clampPersonaReplyText('hello world', 5), 'hello');
  assert.equal(clampPersonaReplyText('abcdefghij', 4), 'abcd');
});

test('maxCompletionTokensForPersonaReply scales with character cap', () => {
  assert.ok(maxCompletionTokensForPersonaReply(100) < maxCompletionTokensForPersonaReply(500));
  assert.ok(maxCompletionTokensForPersonaReply(100) >= 24);
});
