import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../config/api";
import { useEyeGestures }from "../hooks/useEyeGestures";
import ReadingResultCard from "./ReadingResultCard";
import "./ReadingSession.css";
import StatusBar from "./StatusBar";

const texts = [
  { id: "txt001", level: "Fácil", content: "El sol brilla en el cielo azul." },
  { id: "txt002", level: "Intermedio", content: "Los animales del bosque se reúnen cada mañana para buscar alimento." },
  { id: "txt003", level: "Difícil", content: "La neuroplasticidad permite que el cerebro reorganice sus conexiones sinápticas en respuesta a estímulos." }
];

export default function ReadingSession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [gazeData, setGazeData] = useState([]);
  const [status, setStatus] = useState({
    faceDetected: false,
    eyeTrackingActive: false,
    voiceRecorded: false
  });

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  
  // ✅ Integración con EyeGestures
  const { isTracking } = useEyeGestures((data) => {
    if (data?.x && data?.y) {
      setGazeData((prev) => [...prev, { x: data.x, y: data.y, timestamp: Date.now() }]);
    }
  });

   // ✅ Actualizar estado visual de seguimiento ocular
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        eyeTrackingActive: isTracking()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const handleVoiceRecorded = () => {
    setStatus((prev) => ({ ...prev, voiceRecorded: true }));
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    setStatus((prev) => ({ ...prev, voiceRecorded: false }));

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", blob, "reading.wav");

      const res = await fetch(`${API_BASE_URL}/analyze-voice`, {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      console.log("Análisis:", result);

      const predictionRes = await fetch(`${API_BASE_URL}/predict-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words_per_minute: result.words_per_minute,
          error_rate: result.error_rate,
          fluency_score: result.fluency_score,
          attention_score: result.attention_score
        })
      });

      const predictionData = await predictionRes.json();
      setPrediction(predictionData);
      handleVoiceRecorded();

      await fetch(`${API_BASE_URL}/register-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words_per_minute: result.words_per_minute,
          error_rate: result.error_rate,
          fluency_score: result.fluency_score,
          attention_score: result.attention_score,
          label: "normal",
          text_id: texts[currentIndex].id,
          text_level: texts[currentIndex].level,
          text_content: texts[currentIndex].content,
          face_detected: status.faceDetected,
          eye_tracking_active: status.eyeTrackingActive,
          voice_recorded: status.voiceRecorded
        })
      });

      console.log("✅ Lectura registrada");
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const nextText = () => {
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      <div className="reading-container">
        <h2>Texto {currentIndex + 1} — Nivel: {texts[currentIndex].level}</h2>
        <p style={{ fontSize: "1.2em", lineHeight: "1.6" }}>{texts[currentIndex].content}</p>

        {!recording ? (
          <button onClick={startRecording}>🎙️ Empezar lectura</button>
        ) : (
          <button onClick={stopRecording}>⏹️ Terminar lectura</button>
        )}

        {currentIndex < texts.length - 1 && !recording && (
          <button onClick={nextText}>➡️ Siguiente texto</button>
        )}

        {prediction && (
          <ReadingResultCard prediction={prediction} gazeData={gazeData} />
        )}
      </div>
      
      {recording && <StatusBar status={status} />}
      {recording && <EyeTracker gazeData={gazeData} />}
    </>
  );
}
