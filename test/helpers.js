// Утилиты для тестов: создание временного дерева файлов.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

// Создаёт временную директорию и наполняет её по карте { 'rel/path': 'content' }.
// Возвращает { root, cleanup }.
function makeTree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return {
    root,
    cleanup() { fs.rmSync(root, { recursive: true, force: true }); }
  };
}

module.exports = { makeTree };
