'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { scanDir, isBinary, MAX_FILE_BYTES } = require('../src/scanner');
const { makeTree } = require('./helpers');

function relsOf(files) { return files.map((f) => f.rel); }
function byRel(files, rel) { return files.find((f) => f.rel === rel); }

test('respects .gitignore patterns', async () => {
  const t = makeTree({
    'src/index.js': 'console.log(1)\n',
    'dist/bundle.js': 'IGNORED\n',
    'debug.log': 'IGNORED\n',
    '.gitignore': 'dist/\n*.log\n'
  });
  try {
    const files = await scanDir(t.root);
    const rels = relsOf(files);
    assert.ok(rels.includes('src/index.js'));
    assert.ok(rels.includes('.gitignore'));
    assert.ok(!rels.includes('dist/bundle.js'), 'dist/ must be ignored');
    assert.ok(!rels.includes('debug.log'), '*.log must be ignored');
  } finally { t.cleanup(); }
});

test('applies default ignores even without .gitignore', async () => {
  const t = makeTree({
    'app.js': 'x\n',
    'node_modules/dep/index.js': 'IGNORED\n',
    '.git/config': 'IGNORED\n'
  });
  try {
    const rels = relsOf(await scanDir(t.root));
    assert.ok(rels.includes('app.js'));
    assert.ok(!rels.some((r) => r.startsWith('node_modules/')), 'node_modules ignored by default');
    assert.ok(!rels.some((r) => r.startsWith('.git/')), '.git ignored by default');
  } finally { t.cleanup(); }
});

test('flags binary files by extension', async () => {
  const t = makeTree({
    'logo.png': Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString('binary'),
    'readme.txt': 'hello\n'
  });
  try {
    const files = await scanDir(t.root);
    assert.equal(byRel(files, 'logo.png').binary, true);
    assert.equal(byRel(files, 'readme.txt').binary, false);
  } finally { t.cleanup(); }
});

test('flags oversized files as binary (size cap)', async () => {
  const big = 'a'.repeat(MAX_FILE_BYTES + 10);
  const t = makeTree({ 'big.txt': big, 'small.txt': 'tiny' });
  try {
    const files = await scanDir(t.root);
    assert.equal(byRel(files, 'big.txt').binary, true, 'over 1MB → binary/skip');
    assert.equal(byRel(files, 'small.txt').binary, false);
  } finally { t.cleanup(); }
});

test('isBinary helper detects known extensions', () => {
  assert.equal(isBinary('a.zip'), true);
  assert.equal(isBinary('a.PNG'), true);
  assert.equal(isBinary('a.js'), false);
});

test('throws on missing directory', async () => {
  await assert.rejects(() => scanDir('/no/such/dir/lc-xyz-123'), /не найдена/);
});

test('results are sorted by relative path', async () => {
  const t = makeTree({ 'z.js': '1', 'a.js': '1', 'm/b.js': '1' });
  try {
    const rels = relsOf(await scanDir(t.root));
    const sorted = [...rels].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(rels, sorted);
  } finally { t.cleanup(); }
});
