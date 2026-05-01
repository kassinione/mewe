# Base
FROM python:3.12.6-slim

# Create work dirictory (./)
WORKDIR /app

# Install poetry (toolchain)
RUN pip install poetry

# Copy poetry files (dependencies)
COPY pyproject.toml poetry.lock ./

# Configure poetry to not create a virtual environment inside the container
RUN poetry config virtualenvs.create false

# Install dependencies only (skip installing the project itself)
RUN poetry install --no-interaction --no-root

# Copy the rest of the application 
COPY . .

EXPOSE 8000

CMD ["poetry", "run", "python", "app.py"]