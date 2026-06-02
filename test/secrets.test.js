'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isSecret } = require('../src/secrets');
const { scanDir } = require('../src/scanner');
const { buildContext, SECRET_PLACEHOLDER } = require('../src/builder');
const { makeTree } = require('./helpers');

test('isSecret detects common secret files', () => {
  for (const name of ['.env', '.env.production', 'server.pem', 'private.key', 'id_rsa', '.npmrc']) {
    assert.equal(isSecret(name), true, `${name} should be a secret`);
  }
  assert.equal(isSecret('credentials.json'), true);
  assert.equal(isSecret('app.js'), false);
  assert.equal(isSecret('readme.md'), false);
});

test('isSecret works with nested relative paths', () => {
  assert.equal(isSecret('config/secrets/id_rsa'), true);
  assert.equal(isSecret('src/keys/server.pem'), true);
  assert.equal(isSecret('src/index.js'), false);
});

test('scanner flags secret files', async () => {
  const t = makeTree({
    '.env': 'API_KEY=topsecret\n',
    'cert.pem': '-----BEGIN PRIVATE KEY-----\n',
    'app.js': 'ok\n'
  });
  try {
    const files = await scanDir(t.root);
    const env = files.find((f) => f.rel === '.env');
    const pem = files.find((f) => f.rel === 'cert.pem');
    const app = files.find((f) => f.rel === 'app.js');
    assert.equal(env.secret, true);
    assert.equal(pem.secret, true);
    assert.equal(app.secret, false);
  } finally { t.cleanup(); }
});

test('builder redacts secret contents by default and reports them', async () => {
  const t = makeTree({
    '.env': 'API_KEY=topsecret-should-not-appear\n',
    'app.js': 'const ok = true;\n'
  });
  try {
    const res = await buildContext(t.root, ['.env', 'app.js'], 'markdown');
    assert.deepEqual(res.secrets, ['.env']);
    assert.ok(!res.text.includes('topsecret-should-not-appear'), 'secret value must be redacted');
    assert.ok(res.text.includes(SECRET_PLACEHOLDER));
    assert.ok(res.text.includes('⚠ secret'), 'secret file marked in output');
    assert.ok(res.text.includes('const ok = true;'), 'normal files still included');
  } finally { t.cleanup(); }
});

test('builder includes secret contents when explicitly allowed', async () => {
  const t = makeTree({ '.env': 'API_KEY=explicit-opt-in\n' });
  try {
    const res = await buildContext(t.root, ['.env'], 'markdown', { includeSecrets: true });
    assert.ok(res.text.includes('explicit-opt-in'));
    assert.deepEqual(res.secrets, ['.env']);
  } finally { t.cleanup(); }
});

test('XML output marks secret files with attribute', async () => {
  const t = makeTree({ 'private.key': 'KEYDATA\n' });
  try {
    const res = await buildContext(t.root, ['private.key'], 'xml');
    assert.ok(res.text.includes('secret="true"'));
    assert.ok(!res.text.includes('KEYDATA'));
  } finally { t.cleanup(); }
});
