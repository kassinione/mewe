import os
from dotenv import load_dotenv
from telegram import MenuButtonWebApp, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# Загружаем .env
load_dotenv()

TOKEN      = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

if not TOKEN or not WEBAPP_URL:
    raise RuntimeError("Не заданы BOT_TOKEN или WEBAPP_URL в .env")

async def start_command(update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Нажмите кнопку в меню 👇")

async def set_menu(app):
    webapp_button = MenuButtonWebApp(
        text="Launch MyApp",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    # Устанавливаем WebApp-кнопку в меню для всех чатов
    await app.bot.set_chat_menu_button(menu_button=webapp_button)

def main():
    # post_init нужно вызывать на билдере до build()
    app = (
        ApplicationBuilder()
        .token(TOKEN)
        .post_init(set_menu)
        .build()
    )

    app.add_handler(CommandHandler("start", start_command))
    app.run_polling()

if __name__ == "__main__":
    main()
