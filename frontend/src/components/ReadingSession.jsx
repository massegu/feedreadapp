import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../config/api";
import MicRecorder from "mic-recorder-to-mp3";
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
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [gazeData, setGazeData] = useState([]);
  const [status, setStatus] = useState({
    faceDetected: false,
    eyeTrackingActive: false,
    voiceRecorded: false
  });

  const recorder = useRef(new MicRecorder({ bitRate: 128 }));

  // 👁️ Inicializa EyeGesturesLite
  useEffect(() => {
  if (window.EyeGestures) {
    const tracker = new window.EyeGestures("video", (point, isCalibrating) => {
      if (point?.[0] && point?.[1]) {
        setGazeData((prev) => [...prev, { x: point[0], y: point[1], timestamp: Date.now() }]);
        setStatus((prev) => ({ ...prev, eyeTrackingActive: true, faceDetected: true }));
      }
    });

    tracker.init().then(() => {
      tracker.start();
    });

    return () => tracker.stop();
  } else {
    console.warn("EyeGestures no está disponible en window");
  }
}, []);

  const startRecording = async () => {
    await recorder.current.start();
    setRecording(true);
    setStartTime(Date.now());
    setStatus((prev) => ({ ...prev, voiceRecorded: false }));
  };

  const stopRecording = async () => {
    const [buffer, blob] = await recorder.current.stop().getMp3();
    setRecording(false);

    if (startTime) {
  const endTime = Date.now();
  const seconds = ((endTime - startTime) / 1000).toFixed(2);
  setDuration(seconds);
}
    const formData = new FormData();
    formData.append("file", blob, "reading.mp3");

    try {
      const res = await fetch(`${API_BASE_URL}/analyze-voice`, {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      console.log("📝 Resultado:", result);
      setStatus((prev) => ({ ...prev, voiceRecorded: true }));

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
          voice_recorded: status.voiceRecorded,
          duration:parseFloat(duration)
        })
      });
    } catch (err) {
      console.error("❌ Error al enviar audio:", err);
      alert("Hubo un problema al analizar tu voz. Revisa la consola.");
    }
  };

  const nextText = () => {
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setDuration(null);
  };

  return (
    <>
      <div className="reading-container">
       <h2>Lee el siguiente texto:</h2>
       <p style={{ fontSize: "1.2em", lineHeight: "1.6" }}>{texts[currentIndex].content}</p>
        {duration && <p>⏱️ Tiempo de lectura: {duration} segundos</p>}

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
        {/* ✅ Elementos requeridos por EyeGesturesLite */}
        <div id="status" style={{ display: "none" }}></div>
        <div id="error" style={{ display: "none", color: "red" }}></div>
        <video id="video" style={{ display: "none" }} />
      </div>

      {recording && <StatusBar status={status} />}
    </>
  );
}
