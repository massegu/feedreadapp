# main.py
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import csv
import json
import pickle
import joblib
import whisper
import tempfile
import os

app = FastAPI()
@app.get("/")
def read_root():
    return {"message": "Backend activo"}

# Middleware CORS
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

# Registrar lectura en CSV
@app.post("/register-reading")
async def register_reading(request: Request):
    data = await request.json()
    filepath = "data/readings.csv"
    file_exists = os.path.isfile(filepath)

    with open(filepath, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow([
                "id", "timestamp", "user_id", "text_id",
                "words_per_minute", "error_rate", "fluency_score", "attention_score", "label"
            ])
        writer.writerow([
            data["id"],
            datetime.utcnow().isoformat(),
            data["user_id"],
            data["text_id"],
            data["words_per_minute"],
            data["error_rate"],
            data["fluency_score"],
            data["attention_score"],
            data["label"]
        ])
    return {"status": "saved"}

# Registrar lectura en JSON
@app.post("/register-reading-json")
async def register_reading_json(request: Request):
    data = await request.json()
    data["timestamp"] = datetime.utcnow().isoformat()
    filepath = "data/readings.json"

    try:
        with open(filepath, "r") as f:
            readings = json.load(f)
    except FileNotFoundError:
        readings = []

    readings.append(data)

    with open(filepath, "w") as f:
        json.dump(readings, f, indent=2)

    return {"status": "saved"}

#Registrar atención (coordenadas de mirada)

@app.post("/register-attention")
async def register_attention(request: Request):
    data = await request.json()
    data["timestamp"] = datetime.utcnow().isoformat()
    filepath = "data/attention.json"

    try:
        with open(filepath, "r") as f:
            attention_data = json.load(f)
    except FileNotFoundError:
        attention_data = []

    attention_data.append(data)

    with open(filepath, "w") as f:
        json.dump(attention_data, f, indent=2)

    return {"status": "saved"}

# model = joblib.load("data/model.pkl")

import os

@app.post("/predict-reading")
async def predict_reading(data: dict):
    model_path = "data/model.pkl"

    # Si el modelo no existe, devolver etiqueta neutral
    if not os.path.exists(model_path):
        return {
            "label": "desconocido",
            "confidence": 0.0,
            "note": "Modelo no entrenado aún. Registra lecturas para generar datos y luego ejecuta train_model.py"
        }

    # Si el modelo existe, hacer la predicción
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    features = [
        data["words_per_minute"],
        data["error_rate"],
        data["fluency_score"],
        data["attention_score"]
    ]

    prediction = model.predict([features])[0]
    confidence = max(model.predict_proba([features])[0])

    return {
        "label": prediction,
        "confidence": confidence
    }





