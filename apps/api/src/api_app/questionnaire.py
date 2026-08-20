from __future__ import annotations

from typing import Any


BASE_QUESTION_RULES: dict[str, dict[str, Any]] = {
    "sex": {"type": "choice", "choices": {"female", "male"}},
    "ageRange": {"type": "choice", "choices": {"under-16", "18-24", "25-34", "35-44", "45+"}},
    "heightCm": {"type": "number", "min": 100, "max": 250},
    "weightKg": {"type": "number", "min": 30, "max": 300},
    "goal": {
        "type": "multi_choice",
        "choices": {"weight-loss", "muscle-tone", "recovery", "wellbeing"},
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

OPTIONAL_QUESTION_RULES: dict[str, dict[str, Any]] = {
    "contactMethod": {"type": "choice", "choices": {"phone", "max"}},
    "contactValue": {"type": "text"},
}

REQUIRED_QUESTION_IDS = tuple(BASE_QUESTION_RULES.keys())
ALL_QUESTION_IDS = set(BASE_QUESTION_RULES) | set(OPTIONAL_QUESTION_RULES)


def validate_answers(
    answers: dict[str, Any],
    *,
    require_contact: bool = False,
) -> dict[str, Any]:
    normalized: dict[str, Any] = {}

    for question_id in REQUIRED_QUESTION_IDS:
        if question_id not in answers:
            raise ValueError(f"Missing answer for {question_id}")

    extra_keys = set(answers) - ALL_QUESTION_IDS
    if extra_keys:
        raise ValueError(f"Unexpected answers: {', '.join(sorted(extra_keys))}")

    for question_id, rule in BASE_QUESTION_RULES.items():
        normalized[question_id] = _normalize_answer(question_id, answers[question_id], rule)

    has_contact_method = "contactMethod" in answers
    has_contact_value = "contactValue" in answers

    if require_contact and (not has_contact_method or not has_contact_value):
        raise ValueError("Missing contact details for user without public username")

    if has_contact_method != has_contact_value:
        raise ValueError("contactMethod and contactValue must be provided together")

    if has_contact_method:
        normalized["contactMethod"] = _normalize_answer(
            "contactMethod", answers["contactMethod"], OPTIONAL_QUESTION_RULES["contactMethod"]
        )
        normalized["contactValue"] = _normalize_answer(
            "contactValue", answers["contactValue"], OPTIONAL_QUESTION_RULES["contactValue"]
        )

    return normalized


def _normalize_answer(question_id: str, raw_value: Any, rule: dict[str, Any]) -> Any:
    question_type = rule["type"]

    if question_type == "number":
        if not isinstance(raw_value, (int, float)) or isinstance(raw_value, bool):
            raise ValueError(f"{question_id} must be a number")
        if raw_value < rule["min"] or raw_value > rule["max"]:
            raise ValueError(f"{question_id} must be between {rule['min']} and {rule['max']}")
        return int(raw_value) if int(raw_value) == raw_value else float(raw_value)

    if question_type == "multi_choice":
        if isinstance(raw_value, str):
            raw_items = [raw_value]
        elif isinstance(raw_value, list):
            raw_items = raw_value
        else:
            raise ValueError(f"{question_id} must be a non-empty list")

        if not raw_items:
            raise ValueError(f"{question_id} must be a non-empty list")

        normalized_values: list[str] = []
        for item in raw_items:
            if not isinstance(item, str) or not item.strip():
                raise ValueError(f"{question_id} contains invalid option")
            value = item.strip()
            if value not in rule["choices"]:
                raise ValueError(f"{question_id} has invalid option")
            if value not in normalized_values:
                normalized_values.append(value)

        if not normalized_values:
            raise ValueError(f"{question_id} must be a non-empty list")

        return normalized_values

    if not isinstance(raw_value, str) or not raw_value.strip():
        raise ValueError(f"{question_id} must be a non-empty string")

    value = raw_value.strip()

    if question_type == "text":
        return value

    if question_type == "choice":
        if value not in rule["choices"]:
            raise ValueError(f"{question_id} has invalid option")
        return value

    if question_type == "choice_or_detail":
        if value in rule["choices"]:
            return value

        prefix, separator, detail = value.partition(":")
        if separator != ":":
            raise ValueError(f"{question_id} detail answer must include ':' separator")
        if prefix.strip() not in rule["detail_prefixes"] or not detail.strip():
            raise ValueError(f"{question_id} detail answer is invalid")
        return f"{prefix.strip()}: {detail.strip()}"

    raise ValueError(f"Unsupported question type for {question_id}")
