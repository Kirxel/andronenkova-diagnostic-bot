from __future__ import annotations

from dataclasses import dataclass
import os


def _get_env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip() or default


@dataclass(frozen=True)
class Settings:
    database_url: str
    telegram_bot_token: str
    telegram_init_data_max_age_seconds: int
    trainer_chat_id: int | None = None


def load_settings() -> Settings:
    token = _get_env("TELEGRAM_BOT_TOKEN")
    if not token:
        raise RuntimeError("Environment variable TELEGRAM_BOT_TOKEN is required")
    database_url = _get_env("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Environment variable DATABASE_URL is required")

    return Settings(
        database_url=database_url,
        telegram_bot_token=token,
        telegram_init_data_max_age_seconds=int(
            _get_env("TELEGRAM_INIT_DATA_MAX_AGE_SECONDS", "3600") or "3600"
        ),
        trainer_chat_id=(
            int(_get_env("TRAINER_CHAT_ID")) if _get_env("TRAINER_CHAT_ID") else None
        ),
    )
