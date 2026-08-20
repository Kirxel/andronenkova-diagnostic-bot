from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class TelegramUserPayload(BaseModel):
    telegram_user_id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    language_code: str | None = None


class BotStartUpsertRequest(BaseModel):
    user: TelegramUserPayload
    start_param: str | None = None
    source: str | None = Field(default="bot_start")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_user_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    language_code: str | None


class BotStartUpsertResponse(BaseModel):
    user: UserResponse
    created: bool


class DiagnosticSubmissionRequest(BaseModel):
    initData: str = Field(min_length=1)
    startParam: str | None = None
    answers: dict[str, str | int | float | list[str]]


class DiagnosticSubmissionResponse(BaseModel):
    submission_id: int
    status: str
