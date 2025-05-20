import os
from dotenv import load_dotenv
from telegram import MenuButtonWebApp, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, Application

# .env переменные
load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

if not TOKEN or not WEBAPP_URL:
    raise RuntimeError("Не заданы BOT_TOKEN или WEBAPP_URL в .env")

# Обработчик команды /start
async def start_command(update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton(
            text="Launch MeWe",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Welcome to MeWe 🎉🎉🎉",
        reply_markup=reply_markup
    )

# Установка Web App кнопки в меню
async def set_menu(app: Application):
    webapp_button = MenuButtonWebApp(
        text="Launch MeWe",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    await app.bot.set_chat_menu_button(menu_button=webapp_button)

# Основная функция
def main():
    app = (
        ApplicationBuilder()
        .token(TOKEN)
        .post_init(set_menu)
        .build()
    )

    app.add_handler(CommandHandler("start", start_command))

    print("Бот запущен...")
    app.run_polling()

# Точка входа
if __name__ == '__main__':
    main()
