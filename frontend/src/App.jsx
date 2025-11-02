// frontend/src/App.jsx
import React from 'react';
import UserCounter from './components/UserCounter';
import ReadingSession from "./components/ReadingSession";

const sampleText = `La lectura es una habilidad fundamental que permite acceder al conocimiento, desarrollar el pensamiento crítico y disfrutar de la imaginación.`;

const App = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Evaluador de Calidad Lectora</h1>
      <UserCounter/>
      <ReadingSession/>
    </div>
  );
};

export default App;
