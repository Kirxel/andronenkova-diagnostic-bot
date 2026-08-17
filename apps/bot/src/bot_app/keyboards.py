from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo


def build_start_keyboard(mini_app_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Поехали 🚀",
                    web_app=WebAppInfo(url=mini_app_url),
                )
            ]
        ]
    )

