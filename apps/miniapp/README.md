# Mini App

React + Vite Telegram Mini App scaffold for Daria Andronenkova's diagnostic flow.

## What is included

- one-question-per-screen questionnaire;
- progress bar, back button, validation, loading/error/success states;
- session draft persistence so answers survive refreshes and network errors;
- Telegram WebApp integration boundary with `ready()`, `expand()`, theme sync, and safe-area CSS variables;
- submission contract that sends `initData` to the backend for server-side verification.

## Environment

- `VITE_API_BASE_URL` - backend base URL, for example `https://api.example.com`
- `VITE_USE_MOCK_API=true` - optional local mock submission mode

## Run

```bash
cd apps/miniapp
pnpm install
pnpm dev
```

## Submission contract

The Mini App posts to:

```text
POST {VITE_API_BASE_URL}/api/diagnostic-submissions
```

Payload shape:

```json
{
  "initData": "<Telegram WebApp initData>",
  "startParam": "<tgWebAppStartParam or null>",
  "answers": {
    "sex": "female",
    "weightKg": 65
  }
}
```

The frontend never decides the Telegram user identity on its own. The backend must verify `initData` and bind the submission to the Telegram user server-side.

## Local stack

For local PostgreSQL + API + bot startup, copy `.env.example` to `.env` and run:

```bash
docker compose up
```
