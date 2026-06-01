// Обход директории проекта с учётом .gitignore и дефолтных исключений.
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const ignore = require('ignore');

const DEFAULT_IGNORE = [
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'out', 'target',
  '.idea', '.vscode', '.gradle', '.venv', 'venv', '__pycache__', '.next', '.cache',
  'coverage', '*.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
];

// Расширения, которые считаем бинарными/нетекстовыми → пропускаем содержимое.
const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg', '.pdf', '.zip', '.gz', '.tar',
  '.rar', '.7z', '.exe', '.dll', '.so', '.dylib', '.class', '.jar', '.mp3', '.mp4', '.mov', '.avi',
  '.wav', '.ttf', '.otf', '.woff', '.woff2', '.eot', '.psd', '.ai', '.bin', '.dat', '.db', '.sqlite',
  '.pyc', '.o', '.a', '.lib', '.wasm', '.node'
]);

const MAX_FILE_BYTES = 1024 * 1024; // 1 МБ — крупнее пропускаем из контекста

function isBinary(name) { return BINARY_EXT.has(path.extname(name).toLowerCase()); }

async function readGitignore(root) {
  const ig = ignore().add(DEFAULT_IGNORE);
  try {
    const gi = await fsp.readFile(path.join(root, '.gitignore'), 'utf8');
    ig.add(gi);
  } catch (e) { /* нет .gitignore — ок */ }
  return ig;
}

async function walk(dir, root, ig, out) {
  let entries;
  try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    let rel = path.relative(root, abs).split(path.sep).join('/');
    if (!rel) continue;
    const test = ent.isDirectory() ? rel + '/' : rel;
    if (ig.ignores(test)) continue;
    if (ent.isDirectory()) {
      await walk(abs, root, ig, out);
    } else if (ent.isFile()) {
      let size = 0;
      try { size = (await fsp.stat(abs)).size; } catch (e) {}
      out.push({ rel, size, binary: isBinary(ent.name) || size > MAX_FILE_BYTES });
    }
  }
}

async function scanDir(root) {
  if (!root || !fs.existsSync(root)) throw new Error('Папка не найдена');
  const ig = await readGitignore(root);
  const out = [];
  await walk(root, root, ig, out);
  out.sort((a, b) => a.rel.localeCompare(b.rel));
  return out;
}

module.exports = { scanDir, MAX_FILE_BYTES };
