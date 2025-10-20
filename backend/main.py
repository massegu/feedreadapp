# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()
# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()

# Permitir peticiones desde cualquier origen (útil para desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Contador de usuarios
user_count = 0

@app.get("/register-user")
def register_user():
    global user_count
    user_count += 1
    return {"user_count": user_count}

# Cargar modelo de Whisper
model = whisper.load_model("base")

@app.post("/analyze-voice")
async def analyze_voice(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    os.remove(tmp_path)

    text = result["text"]
    duration = result["segments"][-1]["end"] if result["segments"] else 0
    words = len(text.split())
    wpm = round(words / (duration / 60), 2) if duration > 0 else 0

    feedback = {
        "transcription": text,
        "duration": duration,
        "words_per_minute": wpm,
        "fluency": "Buena" if wpm > 120 else "Mejorable"
    }

    return feedback





