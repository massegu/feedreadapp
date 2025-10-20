// VoiceRecorder.jsx
import React, { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorderRef.current.onstop = sendAudio;
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const sendAudio = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    await fetch('http://localhost:8000/analyze-voice', {
      method: 'POST',
      body: formData,
    });

    audioChunks.current = [];
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Detener' : 'Grabar lectura'}
      </button>
    </div>
  );
};

export default VoiceRecorder;
