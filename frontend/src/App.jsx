// frontend/src/App.jsx
import React from 'react';
import TextReader from './components/TextReader';
import VoiceRecorder from './components/VoiceRecorder';
import EyeTracker from './components/EyeTracker';
import UserCounter from './components/UserCounter';

const sampleText = `La lectura es una habilidad fundamental que permite acceder al conocimiento, desarrollar el pensamiento crítico y disfrutar de la imaginación.`;

const App = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Evaluador de Calidad Lectora</h1>
      <TextReader text={sampleText} />
      <VoiceRecorder />
      <EyeTracker />
      <UserCounter/>
    </div>
  );
};

export default App;
