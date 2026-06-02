# Security Policy

LocalContext is a privacy-first, fully local tool: it performs no network calls, no telemetry, and no
uploads. Code is scanned, tokenized, and assembled entirely on your device. We still take security
seriously and welcome responsible disclosure.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately:

- Use GitHub's **[Report a vulnerability](https://github.com/DuminAndrew/LocalContext/security/advisories/new)**
  (Security → Advisories) to open a private advisory, **or**
- Email the maintainer at **duminandrew@gmail.com** with the subject `LocalContext security`.

Please include:

- A description of the issue and its impact.
- Steps to reproduce or a proof of concept.
- The affected version and platform.

You can expect an acknowledgement within a few days. Once a fix is available we will coordinate a release
and credit you in the changelog (unless you prefer to remain anonymous).

## Secret Handling

LocalContext flags likely secret files (`.env`, `*.pem`, `*.key`, `id_rsa`, credentials, and similar) and
**excludes their contents from the generated context by default**, marking them in the output. Including
such contents requires an explicit opt-in (the CLI `--secrets` flag). If you find a secret pattern that
slips through, please report it as a security issue so we can extend the detection rules.

## Scope

This policy covers the LocalContext source in this repository. Vulnerabilities in upstream dependencies
(for example Electron) should be reported to those projects; we will track and update them here.
