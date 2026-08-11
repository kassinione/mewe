# MeWe

A Telegram Mini App for discovering and organizing student activities at Far Eastern Federal University (FEFU). The platform lets students create events, find like-minded people, and manage participation — all without leaving Telegram.

## The Idea

Student life is full of scattered activities — group runs, themed meetups, cultural events — but finding out about them and gathering a crowd is often harder than it should be. MeWe solves this: any student can create an event in under a minute, and others can find it through search or category filters and join in.

## Features

- 📅 **Event creation** — title, description, location, date and time, category, participant limit
- 🔍 **Search and filtering** — by title, description, location, and category, with live results
- 🎨 **Telegram theme adaptation** — the UI automatically follows the client's light/dark theme
- 🏛️ **FEFU brand identity** — visual design built on the university's official color palette

## Tech Stack

**Backend**
- Python 3.12, [Flask](https://flask.palletsprojects.com/) with an Application Factory and Blueprints architecture
- SQLAlchemy (ORM) + MySQL
- [Alembic](https://alembic.sqlalchemy.org/) — versioned database schema migrations
- [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) — the bot that launches the Mini App

**Frontend**
- Jinja2 templates with inheritance (`base.html`)
- Vanilla JavaScript, no build tools or frameworks
- CSS custom properties for theming and brand palette

**Infrastructure**
- [uv](https://docs.astral.sh/uv/) — dependency and virtual environment management
- Docker + Docker Compose — three services: `web`, `bot`, `db` (MySQL) with a healthcheck-based readiness check

## Architecture

```
├── bot.py              # Telegram bot — /start command, Mini App launch button
├── run.py              # Flask application entry point
├── docker-compose.yml
├── Dockerfile
├── alembic.ini
├── migrations/          # database schema migration history
└── src/app/
    ├── extensions.py    # SQLAlchemy initialization
    ├── models.py        # ORM models: Category, Event
    ├── errors.py        # centralized error handling (JSON responses)
    ├── routes/          # Blueprints: events, my_events, profile
    ├── templates/        # Jinja2 templates inheriting from base.html
    └── static/           # CSS, JS, icons, fonts
```

## Getting Started

Create a `.env` file in the project root:
```
BOT_TOKEN=your_botfather_token
WEBAPP_URL=https://your-web-service-address
DB_PASSWORD=database_user_password
DB_ROOT_PASSWORD=database_root_password
```

**With Docker Compose:**
```bash
docker compose up -d db                          # start the database
docker compose run --rm web alembic upgrade head  # apply migrations
docker compose up -d --build                      # start bot and web
```

**Locally, without Docker (requires MySQL, e.g. via XAMPP):**
```bash
uv sync
uv run alembic upgrade head
uv run python run.py    # web server at http://localhost:8000
uv run python bot.py    # telegram bot
```

## Project Status

The migration from a PHP prototype to Flask is complete. The application is fully containerized and verified end-to-end: all three services (`web`, `bot`, `db`) run through Docker Compose, and the database schema is versioned via Alembic migrations.

In progress:
- Full event registration flow (`Registration` model)
- Post-event rating system (`Rating` model)
- HTTPS infrastructure for running the Mini App on real devices

## Author

Lev Fedorenko — [GitHub](https://github.com/kassinione)