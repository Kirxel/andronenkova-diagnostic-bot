from __future__ import annotations

from collections.abc import Generator

from fastapi import Request
from sqlalchemy.orm import Session, sessionmaker

from api_app.config import Settings
from api_app.database import get_db_session


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_session_factory(request: Request) -> sessionmaker[Session]:
    return request.app.state.session_factory


def get_db(request: Request) -> Generator[Session, None, None]:
    session_factory = get_session_factory(request)
    yield from get_db_session(session_factory)

