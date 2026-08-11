# MeWe

Telegram Mini App для поиска и организации активностей студентов ДВФУ. Платформа позволяет создавать события, находить единомышленников и управлять участием в мероприятиях — прямо внутри Telegram, без установки отдельного приложения.

## Идея проекта

Студенческая жизнь полна разрозненных активностей — совместные пробежки, тематические встречи, культурные события — но узнать о них и собрать компанию часто сложнее, чем кажется. MeWe решает эту проблему: любой студент может за минуту создать мероприятие, а другие — найти его через поиск или фильтр по категориям и присоединиться.

## Возможности

- 📅 **Создание мероприятий** — название, описание, место, дата и время, категория, лимит участников
- 🔍 **Поиск и фильтрация** — по названию, описанию, месту проведения и категории, с живым обновлением результатов
- 🎨 **Адаптация под тему Telegram** — интерфейс автоматически подстраивается под светлую и тёмную тему клиента
- 🏛️ **Фирменный стиль ДВФУ** — визуальное оформление построено на официальной цветовой палитре университета

## Технологический стек

**Backend**
- Python 3.12, [Flask](https://flask.palletsprojects.com/) с архитектурой Application Factory и Blueprints
- SQLAlchemy (ORM) + MySQL
- [Alembic](https://alembic.sqlalchemy.org/) — версионируемые миграции схемы базы данных
- [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) — бот, запускающий Mini App

**Frontend**
- Jinja2-шаблоны с наследованием (`base.html`)
- Ванильный JavaScript, без сборщиков и фреймворков
- CSS-переменные для тем и фирменной палитры

**Инфраструктура**
- [uv](https://docs.astral.sh/uv/) — управление зависимостями и виртуальным окружением
- Docker + Docker Compose — три сервиса: `web`, `bot`, `db` (MySQL) с healthcheck-проверкой готовности базы

## Архитектура

```
├── bot.py              # Telegram-бот — команда /start, кнопка запуска Mini App
├── run.py              # точка входа Flask-приложения
├── docker-compose.yml
├── Dockerfile
├── alembic.ini
├── migrations/          # история миграций схемы базы данных
└── src/app/
    ├── extensions.py    # инициализация SQLAlchemy
    ├── models.py        # ORM-модели: Category, Event
    ├── errors.py        # централизованная обработка ошибок (JSON-ответы)
    ├── routes/          # Blueprints: events, my_events, profile
    ├── templates/        # Jinja2-шаблоны с наследованием от base.html
    └── static/           # CSS, JS, иконки, шрифты
```

## Быстрый старт

Создайте `.env` в корне проекта:
```
BOT_TOKEN=токен_от_BotFather
WEBAPP_URL=https://адрес_вашего_веб-сервиса
DB_PASSWORD=пароль_пользователя_бд
DB_ROOT_PASSWORD=пароль_root_бд
```

**Через Docker Compose:**
```bash
docker compose up -d db                          # поднять базу данных
docker compose run --rm web alembic upgrade head  # применить миграции
docker compose up -d --build                      # поднять bot и web
```

**Локально, без Docker (потребуется MySQL, например через XAMPP):**
```bash
uv sync
uv run alembic upgrade head
uv run python run.py    # веб-сервер на http://localhost:8000
uv run python bot.py    # телеграм-бот
```

## Статус проекта

Миграция с PHP-прототипа на Flask завершена. Приложение полностью контейнеризировано и проверено end-to-end: три сервиса (`web`, `bot`, `db`) поднимаются через Docker Compose, схема базы данных версионируется через Alembic-миграции.

В разработке:
- Полноценная регистрация на мероприятия (модель `Registration`)
- Система оценок прошедших мероприятий (модель `Rating`)
- HTTPS-инфраструктура для запуска Mini App на реальных устройствах

## Автор

Лев Федоренко — [GitHub](https://github.com/kassinione)