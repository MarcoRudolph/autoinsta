import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTelegramUsernameInput } from './telegramUsername';

test('normalizeTelegramUsernameInput strips @ and lowercases', () => {
  assert.equal(normalizeTelegramUsernameInput('@MyUser_12'), 'myuser_12');
});

test('normalizeTelegramUsernameInput rejects too short', () => {
  assert.equal(normalizeTelegramUsernameInput('abcd'), null);
});

test('normalizeTelegramUsernameInput rejects empty', () => {
  assert.equal(normalizeTelegramUsernameInput('   '), null);
});

test('normalizeTelegramUsernameInput accepts 5 char min', () => {
  assert.equal(normalizeTelegramUsernameInput('abcde'), 'abcde');
});
