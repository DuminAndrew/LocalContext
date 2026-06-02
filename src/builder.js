// Сборка единого контекста из выбранных файлов (Markdown или XML) + подсчёт токенов.
const fs = require('fs').promises;
const path = require('path');
const { countTokens } = require('./tokenizer');
const { isSecret } = require('./secrets');

const LANG = {
  '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.ts': 'typescript',
  '.jsx': 'jsx', '.tsx': 'tsx', '.py': 'python', '.rs': 'rust', '.go': 'go', '.java': 'java',
  '.kt': 'kotlin', '.kts': 'kotlin', '.c': 'c', '.h': 'c', '.cpp': 'cpp', '.cc': 'cpp',
  '.hpp': 'cpp', '.cs': 'csharp', '.rb': 'ruby', '.php': 'php', '.swift': 'swift', '.sh': 'bash',
  '.ps1': 'powershell', '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml', '.toml': 'toml',
  '.md': 'markdown', '.html': 'html', '.css': 'css', '.scss': 'scss', '.sql': 'sql',
  '.xml': 'xml', '.dart': 'dart', '.lua': 'lua'
};
function lang(rel) { return LANG[path.extname(rel).toLowerCase()] || ''; }

const SECRET_PLACEHOLDER = '[[ содержимое скрыто: файл помечен как секрет (LocalContext) ]]';

/**
 * Собирает контекст из набора относительных путей.
 * @param {string} root корень проекта
 * @param {string[]} rels относительные пути выбранных файлов
 * @param {string} format 'markdown' | 'xml'
 * @param {object} [opts]
 * @param {boolean} [opts.includeSecrets=false] включать ли реальное содержимое файлов-секретов
 * @returns {Promise<{text,tokens,chars,included,skipped,secrets,error}>}
 */
async function buildContext(root, rels, format = 'markdown', opts = {}) {
  rels = Array.isArray(rels) ? rels : [];
  const includeSecrets = !!opts.includeSecrets;
  const parts = [];
  let included = 0, skipped = 0;
  const secrets = [];

  if (format === 'markdown') {
    parts.push('# Контекст проекта\n');
    parts.push('## Структура (включённые файлы)\n```\n' + rels.join('\n') + '\n```');
  } else {
    parts.push('<context>');
    parts.push('  <file_list>\n' + rels.join('\n') + '\n  </file_list>');
  }

  for (const rel of rels) {
    const abs = path.join(root, rel);
    const secret = isSecret(rel);
    let content;
    if (secret && !includeSecrets) {
      secrets.push(rel);
      content = SECRET_PLACEHOLDER;
    } else {
      try { content = await fs.readFile(abs, 'utf8'); }
      catch { skipped++; continue; }
      if (secret) secrets.push(rel);
    }
    included++;
    if (format === 'markdown') {
      const tag = secret ? ' ⚠ secret' : '';
      parts.push(`\n## \`${rel}\`${tag}\n\`\`\`${lang(rel)}\n${content}\n\`\`\``);
    } else {
      const attr = secret ? ' secret="true"' : '';
      parts.push(`  <file path="${rel}"${attr}>\n${content}\n  </file>`);
    }
  }
  if (format !== 'markdown') parts.push('</context>');

  const text = parts.join('\n');
  return {
    text,
    tokens: countTokens(text),
    chars: text.length,
    included,
    skipped,
    secrets,
    error: null
  };
}

module.exports = { buildContext, lang, SECRET_PLACEHOLDER };
