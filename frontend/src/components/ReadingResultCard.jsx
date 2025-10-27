import React from "react";
import "./ReadingResultCard.css"; // Puedes personalizar estilos aquí

const labelColors = {
  normal: "#4CAF50",
  dislexia: "#FF9800",
  tdah: "#2196F3",
  dislexia_tdah: "#E91E63",
  desconocido: "#9E9E9E"
};

const labelIcons = {
  normal: "✅",
  dislexia: "🔤",
  tdah: "⚡",
  dislexia_tdah: "🧠",
  desconocido: "❓"
};

export default function ReadingResultCard({ prediction, gazeData }) {
  if (!prediction) return null;

  const { label, confidence } = prediction;
  const color = labelColors[label] || "#9E9E9E";
  const icon = labelIcons[label] || "❓";

  return (
    <div className="reading-result-card" style={{ borderColor: color }}>
      <h3 style={{ color }}>{icon} Perfil lector: {label}</h3>
      <p><strong>Confianza:</strong> {(confidence * 100).toFixed(1)}%</p>
      {prediction.label === "desconocido" && (
        <div className="model-alert">
          ⚠️ El modelo aún no está entrenado. Esta etiqueta es provisional.
          Registra más lecturas y ejecuta <code>train_model.py</code> para activar la predicción personalizada.
        </div>
    )}

      <div className="legend">
        <h4>🧠 Interpretación didáctica</h4>
        {label === "normal" && <p>Lectura fluida, precisa y con buena atención. Sin indicadores de alteración.</p>}
        {label === "dislexia" && <p>Dificultades en precisión y velocidad lectora. Posible alteración fonológica o visual.</p>}
        {label === "tdah" && <p>Lectura rápida pero con fluctuaciones de atención. Posible impulsividad o dispersión.</p>}
        {label === "dislexia_tdah" && <p>Indicadores mixtos: errores, baja fluidez y atención inestable. Requiere evaluación integral.</p>}
        {label === "desconocido" && <p>Perfil no clasificado. Se necesitan más datos o supervisión clínica.</p>}
      </div>

      <div className="gaze-section">
        <h4>👁️ Datos de mirada</h4>
        {gazeData && gazeData.length > 0 ? (
          <ul>
            {gazeData.slice(-5).map((point, i) => (
              <li key={i}>x: {Math.round(point.x)}, y: {Math.round(point.y)}, t: {point.timestamp}</li>
            ))}
          </ul>
        ) : (
          <p>No se han capturado datos de mirada.</p>
        )}
      </div>
    </div>
  );
}
