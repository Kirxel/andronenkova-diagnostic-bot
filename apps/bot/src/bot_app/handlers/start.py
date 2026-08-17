from __future__ import annotations

from aiogram import Router
from aiogram.exceptions import TelegramAPIError
from aiogram.filters import CommandStart
from aiogram.filters.command import CommandObject
from aiogram.types import Message

from bot_app.api import BotApiClient
from bot_app.config import Settings
from bot_app.copy import get_start_text
from bot_app.keyboards import build_start_keyboard


def build_start_router(settings: Settings) -> Router:
    router = Router(name="start")
    api_client = BotApiClient(settings.api_base_url)

    @router.message(CommandStart())
    async def handle_start(message: Message, command: CommandObject) -> None:
        if message.from_user:
            try:
                await api_client.upsert_user_from_start(
                    telegram_user_id=message.from_user.id,
                    username=message.from_user.username,
                    first_name=message.from_user.first_name,
                    last_name=message.from_user.last_name,
                    language_code=message.from_user.language_code,
                    start_param=command.args,
                )
            except Exception:
                pass

        try:
            await message.answer_photo(
                photo=settings.start_photo,
                caption=get_start_text(settings.start_text),
                reply_markup=build_start_keyboard(settings.mini_app_url),
            )
        except TelegramAPIError:
            await message.answer(
                text=get_start_text(settings.start_text),
                reply_markup=build_start_keyboard(settings.mini_app_url),
            )

    return router
