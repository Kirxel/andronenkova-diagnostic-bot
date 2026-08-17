from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    telegram_bot_token: str
    mini_app_url: str
    start_photo: str
    start_text: str | None = None
    api_base_url: str | None = None


def _require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Environment variable {name} is required")

    return value


def load_settings() -> Settings:
    return Settings(
        telegram_bot_token=_require_env("TELEGRAM_BOT_TOKEN"),
        mini_app_url=_require_env("MINI_APP_URL"),
        start_photo=_require_env("START_PHOTO"),
        start_text=os.getenv("START_TEXT"),
        api_base_url=os.getenv("API_BASE_URL"),
    )
