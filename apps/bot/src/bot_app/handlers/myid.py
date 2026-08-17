from __future__ import annotations

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message


def build_myid_router() -> Router:
    router = Router(name="myid")

    @router.message(Command("myid"))
    async def handle_myid(message: Message) -> None:
        if not message.chat:
            return

        await message.answer(
            f"Твой chat id: `{message.chat.id}`\n\n"
            "Сохрани его как TRAINER_CHAT_ID в .env.",
            parse_mode="Markdown",
        )

    return router

