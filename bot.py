import os
from dotenv import load_dotenv
from telegram import MenuButtonWebApp, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, Application

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

if not TOKEN or not WEBAPP_URL:
    raise RuntimeError("Missing BOT_TOKEN or WEBAPP_URL in env file")

# /start
async def start_command(update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton(
            text="Open",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Welcome to MeWe! 🎉🎉🎉",
        reply_markup=reply_markup
    )

# menu button
async def set_menu(app: Application):
    webapp_button = MenuButtonWebApp(
        text="Open",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    await app.bot.set_chat_menu_button(menu_button=webapp_button)

def main():
    app = (
        ApplicationBuilder()
        .token(TOKEN)
        .post_init(set_menu)
        .build()
    )

    app.add_handler(CommandHandler("start", start_command))
    app.run_polling()
    
if __name__ == '__main__':
    main()