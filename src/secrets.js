// Эвристики для обнаружения файлов с секретами/учётными данными.
// Цель — приватность: такие файлы помечаются и по умолчанию исключаются из контекста,
// чтобы ключи и пароли случайно не попали в промпт для LLM.
const path = require('path');

// Точные имена файлов, которые почти всегда содержат секреты.
const SECRET_NAMES = new Set([
  '.env', '.env.local', '.env.development', '.env.production', '.env.test',
  'id_rsa', 'id_dsa', 'id_ecdsa', 'id_ed25519',
  '.npmrc', '.pypirc', '.netrc', 'credentials', '.htpasswd',
  '.dockercfg', '.git-credentials'
]);

// Расширения, типичные для приватных ключей и сертификатов.
const SECRET_EXT = new Set([
  '.pem', '.key', '.pfx', '.p12', '.keystore', '.jks', '.asc', '.ppk'
]);

// Дополнительные шаблоны по имени файла (без учёта регистра).
const SECRET_PATTERNS = [
  /^\.env(\..+)?$/i,          // .env, .env.* (любой суффикс окружения)
  /(^|\.)secret(s)?(\.|$)/i,  // secret(s) где-то в имени
  /(^|[._-])credentials?([._-]|$)/i,
  /(^|[._-])password(s)?([._-]|$)/i,
  /^id_(rsa|dsa|ecdsa|ed25519)(\..+)?$/i
];

// Возвращает true, если файл (по имени/пути) выглядит как носитель секрета.
function isSecret(relOrName) {
  const name = path.basename(String(relOrName || '')).toLowerCase();
  if (!name) return false;
  if (SECRET_NAMES.has(name)) return true;
  if (SECRET_EXT.has(path.extname(name))) return true;
  for (const re of SECRET_PATTERNS) if (re.test(name)) return true;
  return false;
}

module.exports = { isSecret, SECRET_NAMES, SECRET_EXT, SECRET_PATTERNS };
