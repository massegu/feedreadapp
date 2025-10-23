import React, { useState, useRef, useEffect } from "react";


const texts = [
  { id: "txt001", level: "Fácil", content: "El sol brilla en el cielo azul." },
  { id: "txt002", level: "Intermedio", content: "Los animales del bosque se reúnen cada mañana para buscar alimento." },
  { id: "txt003", level: "Difícil", content: "La neuroplasticidad permite que el cerebro reorganice sus conexiones sinápticas en respuesta a estímulos." }
];

export default function ReadingSession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  useEffect(() => {
  const loadWebGazer = async () => {
    await import("https://webgazer.cs.brown.edu/webgazer.js");
    if (window.webgazer) {
      window.webgazer.setRegression("ridge")
        .setGazeListener((data, timestamp) => {
          if (data) {
            console.log("Gaze:", data.x, data.y, timestamp);
            // Aquí puedes guardar en array o enviar al backend
          }
        }).begin();
    }
  };

  loadWebGazer();

  return () => {
    if (window.webgazer) {
      window.webgazer.end();
    }
  };
}, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", blob, "reading.wav");

      const res = await fetch("http://localhost:8000/analyze-voice", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      console.log("Análisis:", result);
      // Aquí puedes enviar también los datos de WebGazer y registrar la lectura
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
    </div>
  );
}
