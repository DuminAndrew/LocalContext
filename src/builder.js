// Сборка единого контекста из выбранных файлов (Markdown или XML) + подсчёт токенов.
const fs = require('fs').promises;
const path = require('path');
const { countTokens } = require('./tokenizer');

const LANG = {
  '.js': 'javascript', '.mjs': 'javascript', '.ts': 'typescript', '.jsx': 'jsx', '.tsx': 'tsx',
  '.py': 'python', '.rs': 'rust', '.go': 'go', '.java': 'java', '.kt': 'kotlin', '.kts': 'kotlin',
  '.c': 'c', '.h': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.hpp': 'cpp', '.cs': 'csharp', '.rb': 'ruby',
  '.php': 'php', '.swift': 'swift', '.sh': 'bash', '.ps1': 'powershell', '.json': 'json',
  '.yml': 'yaml', '.yaml': 'yaml', '.toml': 'toml', '.md': 'markdown', '.html': 'html',
  '.css': 'css', '.scss': 'scss', '.sql': 'sql', '.xml': 'xml', '.dart': 'dart', '.lua': 'lua'
};
function lang(rel) { return LANG[path.extname(rel).toLowerCase()] || ''; }

async function buildContext(root, rels, format = 'markdown') {
  rels = Array.isArray(rels) ? rels : [];
  const parts = [];
  let included = 0, skipped = 0;

  if (format === 'markdown') {
    parts.push('# Контекст проекта\n');
    parts.push('## Структура (включённые файлы)\n```\n' + rels.join('\n') + '\n```');
  } else {
    parts.push('<context>');
    parts.push('  <file_list>\n' + rels.join('\n') + '\n  </file_list>');
  }

  for (const rel of rels) {
    const abs = path.join(root, rel);
    let content;
    try { content = await fs.readFile(abs, 'utf8'); }
    catch (e) { skipped++; continue; }
    included++;
    if (format === 'markdown') {
      parts.push(`\n## \`${rel}\`\n\`\`\`${lang(rel)}\n${content}\n\`\`\``);
    } else {
      parts.push(`  <file path="${rel}">\n${content}\n  </file>`);
    }
  }
  if (format !== 'markdown') parts.push('</context>');

  const text = parts.join('\n');
  return { text, tokens: countTokens(text), chars: text.length, included, skipped, error: null };
}

module.exports = { buildContext };
