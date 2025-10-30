import React from "react";
import "./StatusBar.css";

const StatusBar = ({ status }) => {
  const getColor = (value) => (value ? "#4CAF50" : "#F44336"); // verde o rojo

  return (
    <div className="status-bar">
      <div className="status-item" style={{ backgroundColor: getColor(status.faceDetected) }}>
        👤 Rostro detectado / Face detected
      </div>
      <div className="status-item" style={{ backgroundColor: getColor(status.eyeTrackingActive) }}>
        👁️ Seguimiento ocular / Eye tracking
      </div>
      <div className="status-item" style={{ backgroundColor: getColor(status.voiceRecorded) }}>
        🎤 Voz grabada / Voice recorded
      </div>
    </div>
  );
};

export default StatusBar;
