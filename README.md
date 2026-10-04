# MeWe

MeWe is a Telegram Mini App for discovering and organizing student activities at Far Eastern Federal University (FEFU). Students can find events, register for them, and manage events they organize without leaving Telegram.

## Features

- Create events with a category, location, date, duration, participant limit, and description
- Search upcoming events by title, description, and location
- Filter events by one or more categories
- View event details and current registration counts
- Register for events or cancel a registration
- Delete an event as its organizer, before it starts
- View created events and joined events separately on **My events**, with past events in collapsible lists
- Authenticate through Telegram Web App `initData`; no separate password is needed
- Edit the profile description
- Adapt the interface to the Telegram client's light or dark theme

## Tech stack

- Python 3.12, Flask, and Jinja2
- Flask-SQLAlchemy and MySQL 8.4
- Alembic database migrations
- `python-telegram-bot` for the Telegram bot
- Vanilla JavaScript and CSS; the frontend has no build step
- Docker Compose for the web app, bot, and database
- `uv` for Python dependency management

## Application layout

```text
├── bot.py                 # Telegram /start command and Mini App menu button
├── run.py                 # Flask web server entry point
├── docker-compose.yml     # web, bot, and MySQL services
├── migrations/            # Alembic migrations
└── src/app/
    ├── models.py          # Category, Event, User, and Participant models
    ├── routes/            # Authentication, events, participations, and profile
    ├── service/           # Application and authentication logic
    ├── repositories/      # Database queries
    ├── serializers/       # API response serialization
    ├── templates/         # Jinja2 pages
    └── static/            # JavaScript, styles, and icons
```

## Configuration

Create a `.env` file in the repository root. Do not commit it or share its secret values.

```dotenv
# Required
BOT_TOKEN=replace_with_telegram_bot_token
WEBAPP_URL=https://your-public-host/
APP_ORIGIN=https://your-public-host
SECRET_KEY=replace_with_a_long_random_secret
DB_PASSWORD=replace_with_database_user_password
DB_ROOT_PASSWORD=replace_with_database_root_password

# Optional; defaults shown
PORT=8000
WEB_BIND=127.0.0.1
FLASK_DEBUG=false
```

`WEBAPP_URL` is the public HTTPS URL opened by Telegram. `APP_ORIGIN` must be the exact origin of that page (scheme and host, with no path); the backend checks it for state-changing API requests. Flask session cookies are secure and partitioned, so the Mini App must be served over HTTPS.

Docker Compose builds `DATABASE_URL` for the web and bot containers from `DB_PASSWORD` and the Compose database service. When running the app outside Docker, configure `DATABASE_URL` to point to a reachable MySQL database, for example:

```text
mysql+pymysql://mewe:password@localhost/mewe_app
```

The database name and non-secret MySQL user are set by `docker-compose.yml`. `WEB_BIND` controls the host-side address to which the web port is published; keep the default loopback binding when a local reverse proxy provides public HTTPS.

## Run with Docker Compose

Requirements: Docker Engine with the Compose plugin, and a Telegram bot configured to use the same public Mini App URL.

```bash
docker compose build
docker compose run --rm web alembic upgrade head
docker compose up -d
```

The web and bot services wait for MySQL's health check. The web app listens on the configured `PORT`; by default, Compose publishes it only on `127.0.0.1:8000`, ready for a local HTTPS reverse proxy. To inspect service output:

```bash
docker compose logs -f web bot
```

Stop the services with `docker compose down`. The MySQL data volume is preserved; add `-v` only if you intentionally want to remove the database data.

## Run locally

Requirements: Python 3.12, `uv`, a reachable MySQL database, and a publicly accessible HTTPS URL for Telegram Mini App authentication and cookies.

Set the required variables in `.env` (including `DATABASE_URL`), then run:

```bash
uv sync
uv run alembic upgrade head
uv run python run.py
```

The web server defaults to `http://0.0.0.0:8000`; `PORT` changes the port. For Telegram end-to-end use, put it behind HTTPS at `WEBAPP_URL` and set `APP_ORIGIN` to that public origin. Run the bot in a separate terminal:

```bash
uv run python bot.py
```

## Main pages and API

HTML pages:

- `/` — upcoming events, search, multi-category filters, and event details
- `/my_events` — events the current user organizes and events they have joined
- `/profile` — user profile and editable description

The JSON API is under `/api`. Successful responses are unwrapped JSON objects unless the endpoint returns `204 No Content`; errors use `{"error": "message"}`. Protected endpoints use the Flask session cookie.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/sessions` | Validate Telegram `initData` and create a session |
| `GET` | `/api/events` | Search and filter upcoming events; repeat `category` for multiple IDs |
| `POST` | `/api/events` | Create an event |
| `GET` | `/api/events/{id}/participants/me` | Get the current user's participation status |
| `PUT` / `DELETE` | `/api/events/{id}/participants/me` | Register for an event or cancel registration |
| `DELETE` | `/api/events/{id}` | Delete an event as its organizer |
| `GET` | `/api/users/me/events` | List events organized by the current user |
| `GET` | `/api/users/me/participations` | List events joined by the current user, including past events |
| `PATCH` | `/api/users/me` | Update the profile description |

State-changing API requests must come from the configured `APP_ORIGIN`. The browser sends the same-origin session cookie automatically.

## Database migrations

Apply migrations with `alembic upgrade head`. In Docker, use `docker compose run --rm web alembic upgrade head`. Migration history is in `migrations/versions/`.

## Author

Lev Fedorenko — [GitHub](https://github.com/kassinione)
