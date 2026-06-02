'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { countTokens, exact } = require('../src/tokenizer');

test('empty input counts as zero tokens', () => {
  assert.equal(countTokens(''), 0);
  assert.equal(countTokens(null), 0);
  assert.equal(countTokens(undefined), 0);
});

test('counts tokens for plain text', () => {
  const n = countTokens('Hello, world! This is LocalContext.');
  assert.ok(Number.isInteger(n));
  assert.ok(n > 0, 'should produce a positive token count');
});

test('longer text yields more tokens (monotonic)', () => {
  const short = countTokens('hello');
  const long = countTokens('hello hello hello hello hello hello');
  assert.ok(long > short);
});

test('exports exact flag as boolean', () => {
  assert.equal(typeof exact, 'boolean');
});

test('fallback estimate (~chars/4) is sane when used', () => {
  // Когда токенайзер недоступен, оценка = ceil(len/4); проверяем порядок величины.
  const text = 'a'.repeat(400);
  const n = countTokens(text);
  if (exact) {
    assert.ok(n > 0);
  } else {
    assert.equal(n, Math.ceil(text.length / 4));
  }
});
