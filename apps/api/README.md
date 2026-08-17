# API App

Minimal FastAPI backend for Daria Andronenkova's diagnostic funnel.

## Environment

- `DATABASE_URL` - required SQLAlchemy connection string. Use PostgreSQL in normal environments.
- `TELEGRAM_BOT_TOKEN` - required for Mini App `initData` verification.
- `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS` - optional, defaults to `3600`.
- `TRAINER_CHAT_ID` - optional Telegram chat/user ID for private trainer notifications.

## Run

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/daria_diagnostic
alembic upgrade head
PYTHONPATH=src uvicorn api_app.main:app --reload
```

## Endpoints

- `GET /health`
- `POST /api/telegram-users/upsert-from-bot`
- `POST /api/diagnostic-submissions`

## Notes

- Mini App identity is verified server-side from `initData`.
- The API stores analytics events without copying sensitive questionnaire answers into analytics metadata.
- Duplicate final submissions are deduplicated by user + exact answer digest within a short time window.
- If `TRAINER_CHAT_ID` is configured, the API sends one private Telegram notification for each new completed diagnostic submission.
- Runtime startup now expects the schema to exist already; create or update it through Alembic migrations.
