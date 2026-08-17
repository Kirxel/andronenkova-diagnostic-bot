# Bot App

Minimal `aiogram 3` bot scaffold for Daria Andronenkova's diagnostic funnel.

## Environment

- `TELEGRAM_BOT_TOKEN` - Telegram bot token.
- `MINI_APP_URL` - public HTTPS URL of the Telegram Mini App.
- `START_PHOTO` - Telegram file_id or public HTTPS URL for Daria's portrait photo.
- `API_BASE_URL` - optional backend base URL for storing users on `/start`.

Optional:
- `START_TEXT` - override default `/start` caption text.

## Run

```bash
cd apps/bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src python -m bot_app.main
```

## Behavior

- `/start` sends Daria's photo with a caption.
- The message includes one primary button: `Поехали 🚀`.
- The button opens the configured Mini App in Telegram.
- If `API_BASE_URL` is configured, the bot upserts the Telegram user on `/start` before sending the response.
- `/myid` replies with the current private Telegram `chat_id` so the trainer can fill `TRAINER_CHAT_ID`.
