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
pnpm build
pnpm preview --host 0.0.0.0 --port 4173
```

Or with Docker Compose from the repository root in production-style mode:

```bash
docker compose up --build miniapp
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

For local PostgreSQL + API + bot + production Mini App startup, copy `.env.example` to `.env` and run:

```bash
docker compose up
```

## Production Notes

- The `miniapp` Docker Compose service builds a static production bundle and serves it with `nginx`.
- This avoids Telegram mobile issues caused by Vite dev mode and HMR/websocket behavior inside the Telegram WebView.
