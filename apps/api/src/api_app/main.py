from __future__ import annotations

from contextlib import asynccontextmanager
import os

import anyio
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api_app.config import Settings, load_settings
from api_app.database import create_session_factory, verify_database_connection
from api_app.dependencies import get_db, get_settings
from api_app.notifications import TrainerNotificationPayload, send_trainer_notification
from api_app.questionnaire import validate_answers
from api_app.schemas import (
    BotStartUpsertRequest,
    BotStartUpsertResponse,
    DiagnosticSubmissionRequest,
    DiagnosticSubmissionResponse,
)
from api_app.services import create_or_reuse_submission, track_event, upsert_user_from_telegram_payload
from api_app.telegram_auth import TelegramAuthError, verify_init_data


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or load_settings()
    session_factory = create_session_factory(app_settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        verify_database_connection(session_factory)
        app.state.settings = app_settings
        app.state.session_factory = session_factory
        yield

    app = FastAPI(title="Daria Diagnostic API", lifespan=lifespan)
    app.state.settings = app_settings
    app.state.session_factory = session_factory

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/telegram-users/upsert-from-bot", response_model=BotStartUpsertResponse)
    def upsert_from_bot(
        request: BotStartUpsertRequest,
        session: Session = Depends(get_db),
    ) -> BotStartUpsertResponse:
        try:
            user, created = upsert_user_from_telegram_payload(session, request.user)
            track_event(
                session,
                event_name="bot_started",
                user_id=user.id,
                source=request.source,
                metadata={"start_param": request.start_param},
            )
            session.commit()
        except Exception:
            session.rollback()
            raise

        return BotStartUpsertResponse(user=user, created=created)

    @app.post("/api/diagnostic-submissions", response_model=DiagnosticSubmissionResponse)
    def create_submission(
        request: DiagnosticSubmissionRequest,
        session: Session = Depends(get_db),
        settings: Settings = Depends(get_settings),
    ) -> DiagnosticSubmissionResponse:
        try:
            verified = verify_init_data(
                request.initData,
                settings.telegram_bot_token,
                max_age_seconds=settings.telegram_init_data_max_age_seconds,
            )
        except TelegramAuthError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "telegram_auth_failed", "message": str(exc)},
            ) from exc

        try:
            validated_answers = validate_answers(request.answers)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "invalid_answers", "message": str(exc)},
            ) from exc

        try:
            user, _ = upsert_user_from_telegram_payload(
                session,
                payload=request_user_payload_from_verified(verified),
            )
            submission, created = create_or_reuse_submission(
                session,
                user_id=user.id,
                answers=validated_answers,
            )
            if created:
                track_event(
                    session,
                    event_name="diagnostic_completed",
                    user_id=user.id,
                    session_id=verified.query_id,
                    source=request.startParam,
                    metadata={"submission_id": submission.id},
                )
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "duplicate_submission", "message": "Duplicate submission detected"},
            )
        except Exception:
            session.rollback()
            raise

        if created:
            try:
                anyio.run(
                    send_trainer_notification,
                    settings,
                    TrainerNotificationPayload(
                        submission_id=submission.id,
                        telegram_user_id=verified.telegram_user_id,
                        first_name=verified.first_name,
                        username=verified.username,
                        start_param=request.startParam,
                        answers=validated_answers,
                    ),
                )
            except Exception:
                pass

        return DiagnosticSubmissionResponse(submission_id=submission.id, status=submission.status)

    return app


def request_user_payload_from_verified(verified):
    from api_app.schemas import TelegramUserPayload

    return TelegramUserPayload(
        telegram_user_id=verified.telegram_user_id,
        username=verified.username,
        first_name=verified.first_name,
        last_name=verified.last_name,
        language_code=verified.language_code,
    )


if os.getenv("TELEGRAM_BOT_TOKEN"):
    app = create_app()
else:
    app = None
