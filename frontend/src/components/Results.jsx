// frontend/src/components/Results.jsx
import React from 'react';

const Results = ({ results }) => {
  if (!results) return null;

  const { duration, words_per_minute, fluency, transcription } = results;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>📝 Resultados de lectura</h2>
      <ul>
        <li><strong>Duración:</strong> {duration.toFixed(2)} segundos</li>
        <li><strong>Palabras por minuto:</strong> {words_per_minute}</li>
        <li><strong>Fluidez estimada:</strong> {fluency}</li>
        <li><strong>Transcripción:</strong> {transcription}</li>
      </ul>
      <p style={{ marginTop: '1rem' }}>
        {fluency === 'Buena'
          ? '¡Excelente ritmo lector! Sigue practicando para mejorar entonación y comprensión.'
          : 'Tu ritmo lector puede mejorar. Intenta leer en voz alta con pausas naturales y claridad.'}
      </p>
    </div>
  );
};

export default Results;
