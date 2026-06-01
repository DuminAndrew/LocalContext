<div align="center">

<img src=".github/assets/hero.svg" width="100%" alt="LocalContext — Local LLM context builder"/>

<br/>

[![Quick Start](https://img.shields.io/badge/Quick_Start-8B5CF6?style=for-the-badge&logo=rocket&logoColor=white)](#-quick-start)
[![Features](https://img.shields.io/badge/Features-6D28D9?style=for-the-badge&logo=sparkfun&logoColor=white)](#-features)
[![Architecture](https://img.shields.io/badge/Architecture-0EA5E9?style=for-the-badge&logo=diagramsdotnet&logoColor=white)](#-architecture)
[![Roadmap](https://img.shields.io/badge/Roadmap-22D3EE?style=for-the-badge&logo=trello&logoColor=white)](#-roadmap)

<br/>

![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-3FB950?style=flat-square&logo=open-source-initiative&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-1F6FEB?style=flat-square&logo=windows&logoColor=white)

### Pack your codebase into a clean, token-counted prompt — without it ever leaving your machine

LocalContext is a desktop app that turns a project folder into a single, LLM-ready context block.
Pick the files you need, watch the **exact token count** against your model's context window, then export to
**Markdown** or **XML** and copy it straight into ChatGPT, Claude, Gemini, or any local model. No uploads,
no telemetry, no cloud — the scan and the build happen entirely on your device.

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [⚡ Quick Start](#-quick-start)
- [🧭 Usage](#-usage)
- [🗺 Roadmap](#-roadmap)
- [💚 Support / Crypto Donations](#-support--crypto-donations)
- [📄 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 📂 Smart Scan

Point at any project root and LocalContext walks it recursively, honouring your **`.gitignore`** on top of
sensible defaults (`node_modules`, `dist`, `build`, `out`, `target`, `.venv`, lockfiles, and more).
Binary assets and files over **1 MB** are detected and auto-excluded, so the tree stays clean.

</td>
<td width="33%" valign="top">

### 🔢 Token-Accurate

Selected files are counted with **`gpt-tokenizer`** (cl100k / o200k-class BPE, GPT-4 / 4o family),
with a `chars/4` fallback if the encoder is unavailable. A **live estimate** updates as you tick files,
and a **budget bar** shows you against a **128k / 200k / 1M** window — with an over-budget warning.

</td>
<td width="33%" valign="top">

### 🧱 Clean Export

Build a single context block as **Markdown** (per-file fenced blocks with language detection) or
**XML** (`<context>` / `<file path="…">` structure). One click to **copy to clipboard** or **save** to
`.md` / `.txt` / `.xml`. A live preview shows the result before you ship it.

</td>
</tr>
<tr>
<td width="33%" valign="top">

### ☑️ Precise Selection

A checkbox file tree with a **filter box** and **Select All / Clear** controls lets you compose exactly
the context you want. Text files are pre-selected; binaries are greyed out and skipped automatically.

</td>
<td width="33%" valign="top">

### 🔒 Fully Local & Private

Everything runs on-device — there is **no network call, no telemetry, no cloud**. The Electron shell uses
`contextIsolation` with a minimal preload bridge, so the renderer never touches Node or the filesystem directly.

</td>
<td width="33%" valign="top">

### 🖥 Cross-Platform

Built on **Electron 33** and plain Node.js, LocalContext runs the same on **Windows, macOS and Linux** —
no build toolchain, native modules, or external services required to get started.

</td>
</tr>
</table>

---

## 🏗 Architecture

A simple, one-way pipeline: pick a folder, scan it, count tokens, build the block, copy or save.

```
   ┌──────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
   │  Pick folder │ ──▶ │  Scan + filter        │ ──▶ │  Tokenize              │
   │  (dir:pick)  │     │  .gitignore + defaults │     │  gpt-tokenizer (exact) │
   └──────────────┘     │  binary / >1MB skip    │     │  chars/4 fallback      │
                        └───────────────────────┘     └────────────────────────┘
                                                                  │
                                                                  ▼
                        ┌───────────────────────┐     ┌────────────────────────┐
                        │  Copy / Save          │ ◀── │  Build context         │
                        │  clipboard · .md/.xml  │     │  Markdown  or  XML     │
                        └───────────────────────┘     └────────────────────────┘
```

Logic lives in pure, IO-light modules under `src/*`; Electron and all filesystem / dialog / clipboard
access stay at the edges (`main.js` + `preload.js`).

```
LocalContext/
├─ main.js          # Electron main: window + IPC (pick / scan / build / copy / save), dialogs, clipboard
├─ preload.js       # secure contextBridge — exposes a minimal `window.lc` API to the renderer
├─ src/
│  ├─ scanner.js    # recursive walk + .gitignore (ignore) + default ignores + binary / size filters
│  ├─ tokenizer.js  # gpt-tokenizer (exact) with chars/4 fallback
│  └─ builder.js    # assemble Markdown / XML context, per-file language detection, token count
└─ renderer/        # UI — index.html · styles.css · app.js (file tree, budget bar, preview)
```

---

## ⚡ Quick Start

> Requires **Node.js 18+** (ships against Electron 33).

```bash
# 1. Clone
git clone https://github.com/DuminAndrew/LocalContext
cd LocalContext

# 2. Install dependencies
npm install

# 3. Launch
npm start          # or: npm run dev  (opens detached DevTools)
```

---

## 🧭 Usage

1. **Open folder** — pick your project root; LocalContext scans it instantly, honouring `.gitignore`.
2. **Select files** — tick what you need, or use **Select All / Clear** and the **filter box** to narrow down. Binaries and oversized files are skipped for you.
3. **Watch the budget** — the live token estimate and the **128k / 200k / 1M** budget bar tell you when you are about to overflow the model's context window.
4. **Choose a format** — **Markdown** for readable, fenced per-file blocks, or **XML** for structured `<file>` blocks.
5. **Build** — get the exact token count plus a preview of the assembled context.
6. **Copy or Save** — drop it straight into your LLM chat, or export to `.md` / `.txt` / `.xml`.

---

## 🗺 Roadmap

- [ ] **Tauri / Rust v2** — migrate the shell to Tauri for a dramatically lighter, faster binary.
- [ ] **Signature compression** — strip bodies and keep declarations/signatures to fit huge repos into a window.
- [ ] **Custom templates** — user-defined output layouts and per-file headers/footers.
- [ ] **Git URL clone** — paste a repository URL and build context without cloning manually first.
- [ ] **Persisted presets** — remember selected files and budget per project.
- [x] **Markdown & XML export** — fenced per-file Markdown and structured XML blocks.
- [x] **Exact token counting** — `gpt-tokenizer` with a graceful `chars/4` fallback.
- [x] **.gitignore-aware recursive scan** — default ignores, binary detection, 1 MB size cap.

---

## 💚 Support / Crypto Donations

If LocalContext saves you time, you can support its development. **Replace the placeholders below with your real, verified addresses and QR images before publishing.**

| Coin | Network | Address (placeholder) |
|------|---------|-----------------------|
| **BTC** | Bitcoin | `bc1qXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| **ETH** | Ethereum / EVM | `0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| **USDT** | TRON (TRC20) | `TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

<div align="center">

<!-- Drop your QR images in .github/assets/donate/ and swap the placeholders below. -->

| BTC | ETH | USDT (TRC20) |
|:---:|:---:|:---:|
| <img src=".github/assets/donate/btc.png" width="120" alt="BTC QR placeholder"/> | <img src=".github/assets/donate/eth.png" width="120" alt="ETH QR placeholder"/> | <img src=".github/assets/donate/usdt-trc20.png" width="120" alt="USDT TRC20 QR placeholder"/> |

</div>

### 🔐 Donation Safety

- **Always verify the address** on the official release page of this repository — never from forks, issues, or screenshots.
- **Check the network** (TRC20 ≠ ERC20): sending on the wrong chain means the funds are lost.
- A donation is **voluntary support** — it grants no SLA, no priority support, and is **not an investment**.
- Maintainers will **never** ask for donations in private messages.

---

## 📄 License

Released under the **MIT License** — © **Andrew Dumin** ([DuminAndrew](https://github.com/DuminAndrew)).

<div align="center">

<br/>

If LocalContext helped you, consider leaving a star ⭐

[![GitHub stars](https://img.shields.io/github/stars/DuminAndrew/LocalContext?style=social)](https://github.com/DuminAndrew/LocalContext)

</div>
