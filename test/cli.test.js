'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { run, parseArgs, normalizeFormat, applyGlobs } = require('../src/cli');
const { makeTree } = require('./helpers');

// Простой буфер, имитирующий поток с .write().
function sink() {
  let data = '';
  return { write(s) { data += s; }, get text() { return data; } };
}

test('parseArgs reads flags and positional dir', () => {
  const o = parseArgs(['proj', '-f', 'xml', '-o', 'out.xml', '--budget', '500', '--include', '**/*.js']);
  assert.equal(o.dir, 'proj');
  assert.equal(o.format, 'xml');
  assert.equal(o.out, 'out.xml');
  assert.equal(o.budget, 500);
  assert.deepEqual(o.include, ['**/*.js']);
});

test('parseArgs rejects unknown options', () => {
  assert.throws(() => parseArgs(['dir', '--nope']), /Неизвестная опция/);
});

test('normalizeFormat maps aliases', () => {
  assert.equal(normalizeFormat('md'), 'markdown');
  assert.equal(normalizeFormat('markdown'), 'markdown');
  assert.equal(normalizeFormat('xml'), 'xml');
  assert.throws(() => normalizeFormat('pdf'), /Неизвестный формат/);
});

test('applyGlobs filters include and exclude', () => {
  const files = [{ rel: 'a.js' }, { rel: 'b.ts' }, { rel: 'c.js' }];
  const inc = applyGlobs(files, ['**/*.js'], []);
  assert.deepEqual(inc.map((f) => f.rel), ['a.js', 'c.js']);
  const exc = applyGlobs(files, [], ['b.ts']);
  assert.deepEqual(exc.map((f) => f.rel), ['a.js', 'c.js']);
});

test('run builds markdown to stdout and returns 0', async () => {
  const t = makeTree({ 'app.js': 'const x = 1;\n' });
  try {
    const out = sink(); const err = sink();
    const code = await run([t.root, '-f', 'md'], { out, err });
    assert.equal(code, 0);
    assert.ok(out.text.includes('## `app.js`'));
    assert.ok(err.text.includes('Итог:'));
  } finally { t.cleanup(); }
});

test('run returns 1 for missing directory', async () => {
  const out = sink(); const err = sink();
  const code = await run(['/no/such/dir/lc-cli-xyz'], { out, err });
  assert.equal(code, 1);
  assert.ok(err.text.includes('не найдена'));
});

test('run warns on budget overflow but still returns 0', async () => {
  const t = makeTree({ 'app.js': 'const x = 1;\n'.repeat(50) });
  try {
    const out = sink(); const err = sink();
    const code = await run([t.root, '--budget', '1'], { out, err });
    assert.equal(code, 0);
    assert.ok(err.text.includes('Превышен бюджет'));
  } finally { t.cleanup(); }
});

test('run hides secret contents in output', async () => {
  const t = makeTree({ '.env': 'API_KEY=do-not-leak\n', 'app.js': 'ok\n' });
  try {
    const out = sink(); const err = sink();
    const code = await run([t.root], { out, err });
    assert.equal(code, 0);
    assert.ok(!out.text.includes('do-not-leak'));
    assert.ok(err.text.includes('Секретов скрыто'));
  } finally { t.cleanup(); }
});

test('--help returns 0', async () => {
  const out = sink(); const err = sink();
  const code = await run(['--help'], { out, err });
  assert.equal(code, 0);
  assert.ok(out.text.includes('Использование'));
});
