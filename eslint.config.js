'use strict';
// ESLint flat config для LocalContext.
// Разделяем окружения: Node (main/preload/src/test) и браузер (renderer).

const js = require('@eslint/js');

const NODE_GLOBALS = {
  require: 'readonly',
  module: 'writable',
  exports: 'writable',
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

const BROWSER_GLOBALS = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'out/**']
  },
  js.configs.recommended,
  {
    // Node-окружение по умолчанию (main, preload, src, tests).
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: NODE_GLOBALS
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'smart'],
      'no-console': 'off'
    }
  },
  {
    // Renderer выполняется в браузерном контексте Electron.
    files: ['renderer/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: BROWSER_GLOBALS
    }
  },
  {
    files: ['test/**/*.js'],
    rules: {
      'no-unused-vars': 'off'
    }
  }
];
