'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildContext, lang } = require('../src/builder');
const { makeTree } = require('./helpers');

test('builds Markdown context with fenced blocks and language detection', async () => {
  const t = makeTree({
    'app.js': 'const x = 1;\n',
    'readme.md': '# Title\n'
  });
  try {
    const res = await buildContext(t.root, ['app.js', 'readme.md'], 'markdown');
    assert.equal(res.error, null);
    assert.equal(res.included, 2);
    assert.ok(res.text.includes('# Контекст проекта'));
    assert.ok(res.text.includes('```javascript'), 'js fence with language');
    assert.ok(res.text.includes('## `app.js`'));
    assert.ok(res.text.includes('const x = 1;'));
    assert.ok(res.tokens > 0 && res.chars > 0);
  } finally { t.cleanup(); }
});

test('builds XML context with file elements', async () => {
  const t = makeTree({ 'a.py': 'print(1)\n' });
  try {
    const res = await buildContext(t.root, ['a.py'], 'xml');
    assert.ok(res.text.startsWith('<context>'));
    assert.ok(res.text.trim().endsWith('</context>'));
    assert.ok(res.text.includes('<file path="a.py">'));
    assert.ok(res.text.includes('print(1)'));
  } finally { t.cleanup(); }
});

test('language detection maps extensions', () => {
  assert.equal(lang('a.js'), 'javascript');
  assert.equal(lang('a.PY'), 'python');
  assert.equal(lang('a.tsx'), 'tsx');
  assert.equal(lang('a.unknownext'), '');
});

test('counts skipped files that cannot be read', async () => {
  const t = makeTree({ 'real.js': 'ok\n' });
  try {
    const res = await buildContext(t.root, ['real.js', 'missing.js'], 'markdown');
    assert.equal(res.included, 1);
    assert.equal(res.skipped, 1);
  } finally { t.cleanup(); }
});

test('empty selection still produces a valid header', async () => {
  const t = makeTree({ 'x.js': '1' });
  try {
    const res = await buildContext(t.root, [], 'markdown');
    assert.equal(res.included, 0);
    assert.ok(res.text.includes('# Контекст проекта'));
  } finally { t.cleanup(); }
});
