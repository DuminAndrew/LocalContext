// Подсчёт токенов через gpt-tokenizer (cl100k_base / o200k — близко к GPT-4/4o).
// Фолбэк: оценка ~chars/4, если токенайзер недоступен.
let encode = null;
try {
  ({ encode } = require('gpt-tokenizer'));
} catch {
  encode = null;
}

function countTokens(text) {
  if (!text) return 0;
  if (encode) {
    try { return encode(text).length; } catch { /* fallthrough */ }
  }
  return Math.ceil(text.length / 4); // грубая оценка
}

module.exports = { countTokens, exact: !!encode };
