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

## Architecture

- `api/main.py` — FastAPI TODO REST API.
- `api/soap_calculator.py` — SOAP 1.1 calculator service (spyne).
- `frontend/` — static HTML/Tailwind CSS screens (login, dashboard, edit-task, task-detail, calculator).
- `schemas/schemas.ts` — shared Joi schemas used by the test suites.

## Testing

- API integration tests live in a separate repo: [Chronos_App_Api_Testing](https://github.com/jirivondra/Chronos_App_Api_Testing).
- E2E/UI tests live in a separate repo: [Chronos_Playwright_testing](https://github.com/jirivondra/Chronos_Playwright_testing).
- CI (`.github/workflows/`) checks out these external repos to run tests and upload coverage/reports.
