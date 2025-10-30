import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../config/api";
import { loadWebgazer } from "../hooks/useWebgazer";
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
  const videoRef = useRef(null);

  // Inicializar WebGazer y configurar video
  useEffect(() => {
    loadWebgazer().then((webgazer) => {
      webgazer.setRegression("ridge")
        .setGazeListener((data, timestamp) => {
          if (data) {
            console.log(`Gaze at x:${data.x}, y:${data.y}`);
          }
        })
        .begin();

      const interval = setInterval(() => {
        const video = document.getElementById("webgazerVideoFeed");
        if (video) {
          video.style.position = "fixed";
          video.style.bottom = "20px";
          video.style.right = "20px";
          video.style.width = "180px";
          video.style.zIndex = "9999";
          video.style.cursor = "move";
          video.setAttribute("draggable", "true");

          video.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", null);
            const rect = video.getBoundingClientRect();
            video.dataset.offsetX = e.clientX - rect.left;
            video.dataset.offsetY = e.clientY - rect.top;
          });

          document.addEventListener("dragover", (e) => e.preventDefault());
          document.addEventListener("drop", (e) => {
            e.preventDefault();
            const offsetX = parseInt(video.dataset.offsetX || "0", 10);
            const offsetY = parseInt(video.dataset.offsetY || "0", 10);
            video.style.left = `${e.clientX - offsetX}px`;
            video.style.top = `${e.clientY - offsetY}px`;
            video.style.right = "auto";
            video.style.bottom = "auto";
          });

          clearInterval(interval);
        }
      }, 500);
    });

    return () => {
      if (window.webgazer) window.webgazer.end();
    };
  }, []);

  // Actualizar estados visuales
  useEffect(() => {
    const checkFace = () => {
      const overlay = document.getElementById("webgazerFaceOverlay");
      setStatus((prev) => ({ ...prev, faceDetected: !!overlay }));
    };

    const checkEyeTracking = () => {
      setStatus((prev) => ({ ...prev, eyeTrackingActive: window.webgazer?.isReady() }));
    };

    const interval = setInterval(() => {
      checkFace();
      checkEyeTracking();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      <div>
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
    </>
  );
}
