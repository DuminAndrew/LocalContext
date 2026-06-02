#!/usr/bin/env node
// LocalContext — headless CLI.
// Переиспользует scanner/tokenizer/builder, чтобы ядро работало без GUI и было тестируемым.
//
//   localcontext <dir> [-f md|xml] [-o file] [--budget N] [--include glob] [--exclude glob]
//
// Выводит собранный контекст и итог по токенам; код возврата 0 (успех) / 1 (ошибка).
'use strict';

const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const { scanDir } = require('./scanner');
const { buildContext } = require('./builder');
const { exact } = require('./tokenizer');

const pkg = (() => {
  try { return require('../package.json'); } catch { return { version: '0.0.0' }; }
})();

const HELP = `LocalContext v${pkg.version} — упаковка кодовой базы в контекст для LLM (локально).

Использование:
  localcontext <dir> [опции]

Опции:
  -f, --format <md|xml>   Формат вывода (по умолчанию: md).
  -o, --out <file>        Записать контекст в файл вместо stdout.
      --budget <N>        Бюджет токенов; превышение → предупреждение в stderr.
      --include <glob>    Включить только подходящие пути (можно повторять).
      --exclude <glob>    Исключить подходящие пути (можно повторять).
      --secrets           Включать содержимое файлов-секретов (по умолчанию скрыто).
  -h, --help              Показать эту справку.
  -v, --version           Показать версию.

Примеры:
  localcontext . -f md -o context.md
  localcontext src --include "**/*.js" --budget 8000
`;

// Минимальный разбор аргументов без внешних зависимостей.
function parseArgs(argv) {
  const opts = {
    dir: null, format: 'md', out: null, budget: null,
    include: [], exclude: [], secrets: false, help: false, version: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`Опция ${a} требует значения`);
      return v;
    };
    switch (a) {
      case '-h': case '--help': opts.help = true; break;
      case '-v': case '--version': opts.version = true; break;
      case '-f': case '--format': opts.format = next(); break;
      case '-o': case '--out': opts.out = next(); break;
      case '--budget': opts.budget = Number(next()); break;
      case '--include': opts.include.push(next()); break;
      case '--exclude': opts.exclude.push(next()); break;
      case '--secrets': opts.secrets = true; break;
      default:
        if (a.startsWith('-')) throw new Error(`Неизвестная опция: ${a}`);
        if (opts.dir === null) opts.dir = a;
        else throw new Error(`Лишний аргумент: ${a}`);
    }
  }
  return opts;
}

function normalizeFormat(f) {
  const v = String(f || '').toLowerCase();
  if (v === 'md' || v === 'markdown') return 'markdown';
  if (v === 'xml') return 'xml';
  throw new Error(`Неизвестный формат: ${f} (ожидается md|xml)`);
}

// Фильтрует список файлов по include/exclude glob-шаблонам (через пакет ignore).
function applyGlobs(files, include, exclude) {
  let result = files;
  if (include.length) {
    const inc = ignore().add(include);
    result = result.filter((f) => inc.ignores(f.rel));
  }
  if (exclude.length) {
    const exc = ignore().add(exclude);
    result = result.filter((f) => !exc.ignores(f.rel));
  }
  return result;
}

async function run(argv, io = {}) {
  const out = io.out || process.stdout;
  const err = io.err || process.stderr;
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    err.write(String(e.message) + '\n');
    return 1;
  }

  if (opts.help) { out.write(HELP); return 0; }
  if (opts.version) { out.write(pkg.version + '\n'); return 0; }
  if (!opts.dir) { err.write('Ошибка: не указана папка.\n\n' + HELP); return 1; }

  let format;
  try { format = normalizeFormat(opts.format); } catch (e) { err.write(String(e.message) + '\n'); return 1; }

  const root = path.resolve(opts.dir);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    err.write(`Ошибка: папка не найдена: ${root}\n`);
    return 1;
  }

  let files;
  try { files = await scanDir(root); } catch (e) { err.write(`Ошибка сканирования: ${e.message}\n`); return 1; }

  files = applyGlobs(files, opts.include, opts.exclude);
  const rels = files.filter((f) => !f.binary).map((f) => f.rel);

  const res = await buildContext(root, rels, format, { includeSecrets: opts.secrets });
  if (res.error) { err.write(`Ошибка сборки: ${res.error}\n`); return 1; }

  if (opts.out) {
    fs.writeFileSync(path.resolve(opts.out), res.text, 'utf8');
  } else {
    out.write(res.text + '\n');
  }

  // Итог — всегда в stderr, чтобы не загрязнять перенаправляемый контекст в stdout.
  const mode = exact ? 'точно' : 'оценка ~chars/4';
  err.write(`\nИтог: файлов ${res.included}, токенов ${res.tokens} (${mode}), символов ${res.chars}`);
  if (res.skipped) err.write(`, пропущено ${res.skipped}`);
  if (res.secrets && res.secrets.length) {
    err.write(`\n🔒 Секретов скрыто: ${res.secrets.length} → ${res.secrets.join(', ')}`);
  }
  if (opts.out) err.write(`\nЗаписано: ${path.resolve(opts.out)}`);
  err.write('\n');

  if (opts.budget != null && Number.isFinite(opts.budget) && res.tokens > opts.budget) {
    err.write(`⚠ Превышен бюджет: ${res.tokens} > ${opts.budget} (на ${res.tokens - opts.budget})\n`);
  }
  return 0;
}

module.exports = { run, parseArgs, normalizeFormat, applyGlobs };

// Запуск как исполняемого файла.
if (require.main === module) {
  run(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
