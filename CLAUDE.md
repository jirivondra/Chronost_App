# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

All code, comments, commit messages, PR descriptions, and documentation must be written in English, regardless of the language used in the conversation.

## Commands

```bash
# Start the FastAPI backend + SOAP Calculator (http://localhost:8000, http://localhost:8001)
task be-up

# Stop the backend + SOAP Calculator
task be-down

# Serve the frontend (http://localhost:3000)
task fe-up

# Stop the frontend server
task fe-down

# Restart the backend (clean + be-up)
task restart

# Lint (ESLint)
task lint
task lint-fix

# Format check / fix (Prettier)
task format-check

# Run API tests (Jest, in this repo's package.json)
task run-test
```

## Before pushing

Always run `task lint` and `task format-check` (or `task fix` to auto-fix both) before pushing commits.

## Architecture

- `api/main.py` — FastAPI TODO REST API.
- `api/soap_calculator.py` — SOAP 1.1 calculator service (spyne).
- `frontend/` — static HTML/Tailwind CSS screens (login, dashboard, edit-task, task-detail, calculator).
- `schemas/schemas.ts` — shared Joi schemas used by the test suites.

## UI conventions

The frontend has no shared component system — each screen is a standalone HTML file, so a recurring UI block (e.g. a "component") is duplicated markup/JS across files rather than an actual shared include.

When a block appears on more than one screen, treat it as one component with multiple copies: it must look and behave identically everywhere it appears (same data/filtering logic, same visuals, same empty state, same interactions). When you change one occurrence, find and update the others in the same change — don't let copies drift.

Example: the "Upcoming" box (next 7 days of non-completed tasks, date badge + relative day label, click-through) appears on both `dashboard.html` and `calendar.html`. Their `renderUpcoming` implementations are intentionally near-identical; if the behavior changes on one, mirror it on the other.

## Theming (light/dark mode)

Every color is a Material 3 token resolved through a CSS custom property, never a hardcoded hex or `rgba(...)`. Each screen's `tailwind-config` script maps every token (`primary`, `surface`, `on-surface`, etc.) to `rgb(var(--color-<token>) / <alpha-value>)`; the actual RGB triplets are defined once in that screen's `<style>` block as `:root { --color-<token>: r g b; ... }` and again under `.dark { ... }`. Toggling the `dark` class on `<html>` switches every `bg-surface-*`/`text-on-*`/etc. utility already in use at once — no per-element `dark:` classes needed. If a rule needs a color outside a Tailwind utility (e.g. a `background` in a `<style>` block), use `rgb(var(--color-<token>) / <alpha>)` the same way — a hardcoded value there is exactly the kind of bug that shows up as a stray wrong-theme patch once `.dark` is toggled (it happened twice: a task-description fade gradient and the login page's glass-panel background).

The `dark` class is set by an inline `<script>` in `<head>`, before the Tailwind CDN `<script>` tag, so it applies before first paint (no flash of the wrong theme): it reads `localStorage.theme` (`'dark'` / `'light'` / absent = follow `prefers-color-scheme`). Any new screen with a header must copy this script plus the `colors`/`:root`/`.dark` blocks from an existing one — same duplicated-component rule as above. `login.html` and `logout.html` intentionally have no visible toggle (no in-app context to change it from), but still carry the same blocks so they inherit the current/system preference instead of forcing light mode.

## Testing

- API integration tests live in a separate repo: [Chronos_App_Api_Testing](https://github.com/jirivondra/Chronos_App_Api_Testing).
- E2E/UI tests live in a separate repo: [Chronos_Playwright_testing](https://github.com/jirivondra/Chronos_Playwright_testing).
- CI (`.github/workflows/`) checks out these external repos to run tests and upload coverage/reports.
