# LocalContext 🧩

> Prepare and optimize your codebase context **locally** before pasting it into web LLMs (ChatGPT, Claude, Gemini). Pick files, see the **token count** live, respect `.gitignore`, export to Markdown/XML, copy to clipboard. 100% local, 100% private — your code never leaves your machine.

![status](https://img.shields.io/badge/status-MVP-orange) ![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![electron](https://img.shields.io/badge/Electron-33-47848F)

## ✨ Features
- 📂 Open any project folder; recursive scan respecting **`.gitignore`** + sensible defaults (`node_modules`, `dist`, binaries, lockfiles…).
- ☑️ File tree with checkboxes; binary/oversized files auto-excluded.
- 🔢 **Live token estimate** + exact count on build (via `gpt-tokenizer`, cl100k/o200k-class BPE) with a **context-window budget bar** (128k / 200k / 1M).
- 🧱 Output formats: **Markdown** (fenced per file) or **XML** (repomix-style `<file>` blocks).
- 📋 One-click **copy to clipboard** / 💾 **save to file**.
- 🔒 Fully offline: no network, no telemetry, no cloud.

## 🚀 Install & run
```bash
git clone https://github.com/DuminAndrew/LocalContext
cd LocalContext
npm install
npm start          # npm run dev — with DevTools
```
> Requires Node.js 18+ (uses global `fetch`/Electron 33).

## 🧭 Usage
1. **Открыть папку** → pick your project root.
2. Tick the files you want (or **Все** / **Снять**); use the filter box.
3. Watch the token estimate vs your context budget.
4. **Собрать** → exact tokens + preview → **Копировать** / **Сохранить**.

## 🏗️ Architecture
```
main.js            # Electron main: IPC (pick/scan/build/copy/save), dialogs, clipboard
preload.js         # secure bridge (contextIsolation)
src/
  scanner.js       # recursive walk + .gitignore (ignore) + binary/size filters
  tokenizer.js     # gpt-tokenizer (exact) with chars/4 fallback
  builder.js       # assemble Markdown/XML context + token count
renderer/          # UI (index.html / styles.css / app.js)
```
Separation of concerns: pure logic in `src/*` (testable), Electron/IO at the edges. Roadmap: signature-compression (Tree-sitter), git-URL clone, custom templates, **Tauri/Rust migration** for a lighter binary.

## 💚 Support / Crypto donations
If LocalContext saves you time, you can support development. **Replace the placeholders below with your real verified addresses + QR images before publishing.**

| Coin | Network | Address (placeholder) |
|---|---|---|
| BTC | Bitcoin | `bc1qXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| ETH | Ethereum / EVM | `0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| USDT | TRON (TRC20) | `TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

<!-- Поместите QR-коды в assets/donate/ и вставьте: ![BTC](assets/donate/btc.png) -->

### 🔐 Безопасность донатов
- **Всегда проверяйте адрес** на странице репозитория официального релиза (а не из форков/issue/скриншотов).
- Сверяйте сеть (TRC20 ≠ ERC20) — отправка в неверной сети = потеря средств.
- Донат — добровольная поддержка, **не даёт SLA/приоритетной поддержки** и не является инвестицией.
- Мейнтейнеры никогда не просят донаты в личных сообщениях.

## 🤝 Contributing
PRs welcome. Run `npm start`, keep logic in `src/*` pure & covered. See issues for the roadmap.

## 📄 License
MIT © DuminAndrew
