from __future__ import annotations

from dataclasses import dataclass
from typing import Final

import httpx

from api_app.config import Settings


@dataclass(frozen=True)
class TrainerNotificationPayload:
    submission_id: int
    telegram_user_id: int
    first_name: str | None
    username: str | None
    start_param: str | None
    answers: dict[str, str | int | float | list[str]]


ANSWER_LABELS: Final[dict[str, dict[str, str]]] = {
    "sex": {
        "female": "Женщина",
        "male": "Мужчина",
    },
    "ageRange": {
        "under-16": "До 16 лет",
        "18-24": "18-24",
        "25-34": "25-34",
        "35-44": "35-44",
        "45+": "45+",
    },
    "goal": {
        "weight-loss": "Снизить вес",
        "muscle-tone": "Подтянуть тело и стать сильнее",
        "recovery": "Вернуться к тренировкам после паузы",
        "wellbeing": "Улучшить самочувствие и режим",
    },
    "injuries": {
        "none": "Нет, ограничений нет",
        "has-limitations": "Есть ограничения",
        "other": "Свой вариант",
    },
    "experience": {
        "new": "Только начинаю",
        "returning": "Раньше тренировался(ась), сейчас возвращаюсь",
        "regular": "Тренируюсь регулярно",
    },
    "nutrition": {
        "no": "Нет, пока не слежу",
        "sometimes": "Иногда слежу",
        "yes": "Да, отслеживаю стабильно",
    },
    "wellbeing": {
        "great": "В целом хорошо",
        "tired": "Часто не хватает энергии",
        "stressed": "Есть стресс и перегруз",
        "other": "Свой вариант",
    },
    "labTests": {
        "regularly": "Да, проверяюсь регулярно",
        "sometimes": "Иногда",
        "never": "Почти никогда",
    },
    "sleep": {
        "<6": "Меньше 6 часов",
        "6-7": "6-7 часов",
        "7-8": "7-8 часов",
        "8+": "8 часов и больше",
    },
    "readiness": {
        "now": "Хочу начать сейчас",
        "this-week": "На этой неделе",
        "this-month": "В ближайший месяц",
        "not-sure": "Пока присматриваюсь",
    },
}


def build_trainer_message(payload: TrainerNotificationPayload) -> str:
    display_name = payload.first_name or "Пользователь"
    username_line = f"@{payload.username}" if payload.username else "не указан"
    source_line = payload.start_param or "без метки"
    contact_block = build_contact_block(payload.answers)
    answer_lines = [
        f"Пол: {render_answer('sex', payload.answers['sex'])}",
        f"Возраст: {render_answer('ageRange', payload.answers['ageRange'])}",
        f"Рост / вес: {payload.answers['heightCm']} см / {payload.answers['weightKg']} кг",
        f"Цель: {render_answer('goal', payload.answers['goal'])}",
        f"Ограничения: {render_answer('injuries', payload.answers['injuries'])}",
        f"Опыт: {render_answer('experience', payload.answers['experience'])}",
        f"Питание: {render_answer('nutrition', payload.answers['nutrition'])}",
        f"Самочувствие: {render_answer('wellbeing', payload.answers['wellbeing'])}",
        f"Анализы: {render_answer('labTests', payload.answers['labTests'])}",
        f"Сон: {render_answer('sleep', payload.answers['sleep'])}",
        f"Готовность: {render_answer('readiness', payload.answers['readiness'])}",
    ]

    return "\n".join(
        [
            "Новая анкета на диагностику",
            "",
            f"Клиент: {display_name}",
            f"Username: {username_line}",
            "",
            "Профиль",
            answer_lines[0],
            answer_lines[1],
            answer_lines[2],
            "",
            "Запрос и контекст",
            *answer_lines[3:8],
            "",
            "Режим и готовность",
            *answer_lines[8:],
            "",
            *contact_block,
            "Служебно",
            f"ID анкеты: {payload.submission_id}",
            f"Telegram ID: {payload.telegram_user_id}",
            f"Источник: {source_line}",
        ]
    )


def render_answer(question_id: str, value: str | int | float | list[str]) -> str:
    if isinstance(value, list):
        return ", ".join(ANSWER_LABELS.get(question_id, {}).get(item, item) for item in value)

    if not isinstance(value, str):
        return str(value)

    prefix, separator, detail = value.partition(":")
    label = ANSWER_LABELS.get(question_id, {}).get(prefix.strip(), prefix.strip())

    if separator and detail.strip():
        return f"{label} — {detail.strip()}"

    return label


def build_contact_block(answers: dict[str, str | int | float | list[str]]) -> list[str]:
    contact_method = answers.get("contactMethod")
    contact_value = answers.get("contactValue")

    if not isinstance(contact_method, str) or not isinstance(contact_value, str):
        return []

    label = "Телефон" if contact_method == "phone" else "MAX"

    return [
        "Доп. контакт",
        f"{label}: {contact_value}",
        "",
    ]


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
