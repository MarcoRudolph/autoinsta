import assert from 'node:assert/strict';
import test from 'node:test';
import { decideProductLink } from './productLinkDecision';

test('proactive promo starts at 5 incoming messages', () => {
  const decision = decideProductLink({
    links: [{ url: 'https://example.com/a', sendingBehavior: 'proactive', actionType: 'buy' }],
    incomingMessageCount: 5,
    lastPromoAt: null,
    latestUserMessage: 'Hey, how are you?',
    now: new Date('2026-03-06T12:00:00.000Z'),
  });

  assert.equal(decision.shouldSendPromo, true);
  assert.equal(decision.reason, 'proactive_threshold');
});

test('cooldown blocks repeated promo within 24 hours', () => {
  const decision = decideProductLink({
    links: [{ url: 'https://example.com/a', sendingBehavior: 'proactive', actionType: 'buy' }],
    incomingMessageCount: 8,
    lastPromoAt: '2026-03-06T00:00:00.000Z',
    latestUserMessage: 'Can we talk more?',
    now: new Date('2026-03-06T12:00:00.000Z'),
  });

  assert.equal(decision.shouldSendPromo, false);
  assert.equal(decision.reason, 'cooldown_active');
});

test('situational intent triggers situational link', () => {
  const decision = decideProductLink({
    links: [{ url: 'https://example.com/s', sendingBehavior: 'situational', actionType: 'buy' }],
    incomingMessageCount: 1,
    lastPromoAt: null,
    latestUserMessage: 'Do you have a link where I can buy this?',
    now: new Date('2026-03-06T12:00:00.000Z'),
  });

  assert.equal(decision.shouldSendPromo, true);
  assert.equal(decision.reason, 'situational_trigger');
});
