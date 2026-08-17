from __future__ import annotations

from dataclasses import dataclass

import httpx

from api_app.config import Settings


@dataclass(frozen=True)
class TrainerNotificationPayload:
    submission_id: int
    telegram_user_id: int
    first_name: str | None
    username: str | None
    start_param: str | None
    answers: dict[str, str | int | float]


def build_trainer_message(payload: TrainerNotificationPayload) -> str:
    display_name = payload.first_name or "Пользователь"
    username_line = f"@{payload.username}" if payload.username else "username не указан"
    source_line = payload.start_param or "без метки источника"

    answer_lines = [
        f"Пол: {payload.answers['sex']}",
        f"Возраст: {payload.answers['ageRange']}",
        f"Рост: {payload.answers['heightCm']} см",
        f"Вес: {payload.answers['weightKg']} кг",
        f"Цель: {payload.answers['goal']}",
        f"Ограничения: {payload.answers['injuries']}",
        f"Опыт: {payload.answers['experience']}",
        f"Питание: {payload.answers['nutrition']}",
        f"Состояние: {payload.answers['wellbeing']}",
        f"Анализы: {payload.answers['labTests']}",
        f"Сон: {payload.answers['sleep']}",
        f"Готовность: {payload.answers['readiness']}",
    ]

    return "\n".join(
        [
            "Новая диагностическая анкета",
            "",
            f"Submission ID: {payload.submission_id}",
            f"Telegram user ID: {payload.telegram_user_id}",
            f"Имя: {display_name}",
            f"Username: {username_line}",
            f"Источник: {source_line}",
            "",
            *answer_lines,
        ]
    )


async def send_trainer_notification(
    settings: Settings,
    payload: TrainerNotificationPayload,
) -> None:
    if settings.trainer_chat_id is None:
        return

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json={
                "chat_id": settings.trainer_chat_id,
                "text": build_trainer_message(payload),
            },
        )
        response.raise_for_status()
