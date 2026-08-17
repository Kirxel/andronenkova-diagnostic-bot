from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from urllib.parse import parse_qsl


class TelegramAuthError(ValueError):
    pass


@dataclass(frozen=True)
class VerifiedTelegramUser:
    telegram_user_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    language_code: str | None
    auth_date: datetime
    query_id: str | None


def verify_init_data(
    init_data: str,
    bot_token: str,
    *,
    max_age_seconds: int,
    now: datetime | None = None,
) -> VerifiedTelegramUser:
    pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=True)
    payload = dict(pairs)

    received_hash = payload.get("hash")
    if not received_hash:
        raise TelegramAuthError("Missing hash in initData")

    user_raw = payload.get("user")
    if not user_raw:
        raise TelegramAuthError("Missing user in initData")

    auth_date_raw = payload.get("auth_date")
    if not auth_date_raw:
        raise TelegramAuthError("Missing auth_date in initData")

    try:
        auth_timestamp = int(auth_date_raw)
    except ValueError as exc:
        raise TelegramAuthError("Invalid auth_date in initData") from exc

    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    check_pairs = [f"{key}={value}" for key, value in sorted(payload.items()) if key != "hash"]
    data_check_string = "\n".join(check_pairs)
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise TelegramAuthError("Invalid Telegram initData hash")

    current_time = now or datetime.now(UTC)
    auth_date = datetime.fromtimestamp(auth_timestamp, tz=UTC)
    age_seconds = (current_time - auth_date).total_seconds()
    if age_seconds < 0 or age_seconds > max_age_seconds:
        raise TelegramAuthError("Expired Telegram initData")

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError as exc:
        raise TelegramAuthError("Invalid user payload in initData") from exc

    user_id = user.get("id")
    if not isinstance(user_id, int):
        raise TelegramAuthError("Missing Telegram user id in initData")

    return VerifiedTelegramUser(
        telegram_user_id=user_id,
        username=user.get("username"),
        first_name=user.get("first_name"),
        last_name=user.get("last_name"),
        language_code=user.get("language_code"),
        auth_date=auth_date,
        query_id=payload.get("query_id"),
    )

