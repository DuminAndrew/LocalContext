# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-02

### Added

- Initial release of **LocalContext** — a local, private tool to prepare and
  optimize source-code context for sending to an LLM.
- **Electron desktop UI**: pick a folder, browse the file tree, search/filter,
  select files, see a live token estimate against a configurable budget, build,
  preview, copy to clipboard, and save to disk.
- **Headless CLI** (`localcontext`) for scripting and CI: scan a directory,
  select by glob/path, choose output format, and write the result to a file or
  stdout.
- **Token counting** via `gpt-tokenizer` (cl100k/o200k-class) with a transparent
  `~chars/4` fallback when the tokenizer is unavailable.
- **`.gitignore`-aware scanning** using the `ignore` package, plus binary-file
  detection so non-text assets are excluded from the context.
- **Secret detection and redaction** (`src/secrets.js`): files matching common
  secret patterns (`.env`, `*.pem`, key/credential files, etc.) are flagged in
  the UI, redacted from the built context by default, and reported — with an
  explicit opt-in to include their contents.
- **Markdown and XML** output formats, both annotating redacted secret files.
- Test suite (`node --test`) covering the scanner, builder, tokenizer, secret
  detection, and CLI.
- **ESLint** flat configuration and a CI workflow with a Node 18/20/22 matrix.

[Unreleased]: https://github.com/DuminAndrew/LocalContext/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/DuminAndrew/LocalContext/releases/tag/v0.1.0
