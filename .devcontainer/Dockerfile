# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/python:3.10

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Whisper
RUN pip install openai-whisper

# Instalar PostgreSQL
RUN apt-get update && \
    apt-get install -y postgresql postgresql-contrib && \
    service postgresql start
    
WORKDIR /workspaces/feedreadapp
