from __future__ import annotations

import httpx


class BotApiClient:
    def __init__(self, base_url: str | None):
        self.base_url = base_url.rstrip("/") if base_url else None

    async def upsert_user_from_start(
        self,
        *,
        telegram_user_id: int,
        username: str | None,
        first_name: str | None,
        last_name: str | None,
        language_code: str | None,
        start_param: str | None,
    ) -> None:
        if not self.base_url:
            return

        payload = {
            "user": {
                "telegram_user_id": telegram_user_id,
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "language_code": language_code,
            },
            "start_param": start_param,
        }

        async with httpx.AsyncClient(base_url=self.base_url, timeout=5.0) as client:
            response = await client.post("/api/telegram-users/upsert-from-bot", json=payload)
            response.raise_for_status()

