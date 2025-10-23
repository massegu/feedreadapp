# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/python:3.10

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copia requirements y lo instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Expone el puerto para FastAPI
EXPOSE 8000

# Whisper
RUN pip install openai-whisper

# Instalar PostgreSQL
RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /workspaces/feedreadapp
