# main.py
from fastapi import FastAPI, File, UploadFile
import whisper
import tempfile
import os

app = FastAPI()
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
