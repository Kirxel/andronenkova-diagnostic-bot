from __future__ import annotations

from typing import Any


QUESTION_RULES: dict[str, dict[str, Any]] = {
    "sex": {"type": "choice", "choices": {"female", "male"}},
    "ageRange": {"type": "choice", "choices": {"under-16", "18-24", "25-34", "35-44", "45+"}},
    "heightCm": {"type": "number", "min": 100, "max": 250},
    "weightKg": {"type": "number", "min": 30, "max": 300},
    "goal": {
        "type": "choice_or_detail",
        "choices": {"weight-loss", "muscle-tone", "recovery", "wellbeing"},
        "detail_prefixes": {"other"},
    },
    "injuries": {
        "type": "choice_or_detail",
        "choices": {"none"},
        "detail_prefixes": {"has-limitations", "other"},
    },
    "experience": {"type": "choice", "choices": {"new", "returning", "regular"}},
    "nutrition": {"type": "choice", "choices": {"no", "sometimes", "yes"}},
    "wellbeing": {
        "type": "choice_or_detail",
        "choices": {"great", "tired", "stressed"},
        "detail_prefixes": {"other"},
    },
    "labTests": {"type": "choice", "choices": {"regularly", "sometimes", "never"}},
    "sleep": {"type": "choice", "choices": {"<6", "6-7", "7-8", "8+"}},
    "readiness": {"type": "choice", "choices": {"now", "this-week", "this-month", "not-sure"}},
}

REQUIRED_QUESTION_IDS = tuple(QUESTION_RULES.keys())


def validate_answers(answers: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}

    for question_id in REQUIRED_QUESTION_IDS:
        if question_id not in answers:
            raise ValueError(f"Missing answer for {question_id}")

    extra_keys = set(answers) - set(REQUIRED_QUESTION_IDS)
    if extra_keys:
        raise ValueError(f"Unexpected answers: {', '.join(sorted(extra_keys))}")

    for question_id, rule in QUESTION_RULES.items():
        raw_value = answers[question_id]
        question_type = rule["type"]

        if question_type == "number":
            if not isinstance(raw_value, (int, float)) or isinstance(raw_value, bool):
                raise ValueError(f"{question_id} must be a number")
            if raw_value < rule["min"] or raw_value > rule["max"]:
                raise ValueError(f"{question_id} must be between {rule['min']} and {rule['max']}")
            normalized[question_id] = int(raw_value) if int(raw_value) == raw_value else float(raw_value)
            continue

        if not isinstance(raw_value, str) or not raw_value.strip():
            raise ValueError(f"{question_id} must be a non-empty string")

        value = raw_value.strip()

        if question_type == "choice":
            if value not in rule["choices"]:
                raise ValueError(f"{question_id} has invalid option")
            normalized[question_id] = value
            continue

        if question_type == "choice_or_detail":
            if value in rule["choices"]:
                normalized[question_id] = value
                continue

            prefix, separator, detail = value.partition(":")
            if separator != ":":
                raise ValueError(f"{question_id} detail answer must include ':' separator")
            if prefix.strip() not in rule["detail_prefixes"] or not detail.strip():
                raise ValueError(f"{question_id} detail answer is invalid")
            normalized[question_id] = f"{prefix.strip()}: {detail.strip()}"
            continue

        raise ValueError(f"Unsupported question type for {question_id}")

    return normalized
