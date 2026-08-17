from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from api_app.models import AnalyticsEvent, DiagnosticSubmission, User
from api_app.schemas import TelegramUserPayload


def upsert_user_from_telegram_payload(
    session: Session,
    payload: TelegramUserPayload,
) -> tuple[User, bool]:
    user = session.scalar(select(User).where(User.telegram_user_id == payload.telegram_user_id))
    created = False

    if user is None:
        user = User(
            telegram_user_id=payload.telegram_user_id,
            username=payload.username,
            first_name=payload.first_name,
            last_name=payload.last_name,
            language_code=payload.language_code,
            last_seen_at=datetime.now(UTC),
        )
        session.add(user)
        session.flush()
        created = True
    else:
        user.username = payload.username
        user.first_name = payload.first_name
        user.last_name = payload.last_name
        user.language_code = payload.language_code
        user.last_seen_at = datetime.now(UTC)
        session.flush()

    return user, created


def track_event(
    session: Session,
    *,
    event_name: str,
    user_id: int | None = None,
    session_id: str | None = None,
    source: str | None = None,
    metadata: dict | None = None,
) -> AnalyticsEvent:
    event = AnalyticsEvent(
        user_id=user_id,
        event_name=event_name,
        session_id=session_id,
        source=source,
        metadata_json=metadata or {},
    )
    session.add(event)
    session.flush()
    return event


def create_or_reuse_submission(
    session: Session,
    *,
    user_id: int,
    answers: dict,
    dedupe_window_seconds: int = 300,
) -> tuple[DiagnosticSubmission, bool]:
    answer_digest = hashlib.sha256(
        json.dumps(answers, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()

    now = datetime.now(UTC)
    dedupe_window_start = now.replace(
        second=(now.second // dedupe_window_seconds) * dedupe_window_seconds,
        microsecond=0,
    )

    submission = session.scalar(
        select(DiagnosticSubmission).where(
            DiagnosticSubmission.user_id == user_id,
            DiagnosticSubmission.answer_digest == answer_digest,
            DiagnosticSubmission.dedupe_window_start == dedupe_window_start,
        )
    )
    if submission is not None:
        return submission, False

    submission = DiagnosticSubmission(
        user_id=user_id,
        status="completed",
        answers=answers,
        answer_digest=answer_digest,
        dedupe_window_start=dedupe_window_start,
        completed_at=now,
    )
    session.add(submission)
    session.flush()
    return submission, True
