# Contributing to LocalContext

Thanks for your interest in improving LocalContext! Contributions of all kinds are welcome — bug
reports, feature ideas, documentation fixes, and code.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to
uphold it.

## Getting Started

```bash
git clone https://github.com/DuminAndrew/LocalContext
cd LocalContext
npm install
```

Useful scripts:

| Command | What it does |
|---------|--------------|
| `npm start` | Launch the Electron desktop app |
| `npm run dev` | Launch with detached DevTools |
| `npm run cli -- examples -f md` | Run the headless CLI against the demo folder |
| `npm run lint` | Run ESLint over the whole project |
| `npm test` | Run the test suite (`node --test`) |

## Project Layout

- `src/` — pure, IO-light core (`scanner`, `tokenizer`, `builder`, `secrets`) plus the headless `cli.js`.
- `main.js` / `preload.js` — Electron shell and the secure `contextBridge` API.
- `renderer/` — the UI (HTML/CSS/JS), browser context only.
- `test/` — `node:test` suites mirroring the `src/` modules.
- `examples/` — a tiny sample tree used by the CLI smoke test and the docs.

Keep business logic in `src/`. Electron, filesystem, dialog, and clipboard access belong at the edges
(`main.js` / `preload.js`) so the core stays testable without a GUI.

## Making Changes

1. Create a branch off `main`.
2. Add or update tests for any behavior change. The core is fully testable through `src/cli.js` and the
   exported functions — please cover new logic.
3. Run the full local gate before opening a PR:
   ```bash
   npm run lint
   npm test
   node src/cli.js examples -f md
   ```
4. Keep commits focused and write clear messages.

## Pull Requests

- Fill in the PR template and describe the motivation and the change.
- Make sure CI is green (lint + tests on Node 18 / 20 / 22).
- One logical change per PR keeps reviews fast.

## Reporting Bugs and Requesting Features

Use the issue templates under **Issues → New issue**. For anything security-sensitive, please follow
[SECURITY.md](SECURITY.md) instead of opening a public issue.
