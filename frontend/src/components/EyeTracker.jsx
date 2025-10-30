// EyeTracker.jsx
import React from "react";

export default function EyeTracker({ gazeData = [] }) {
  const last = gazeData.length > 0 ? gazeData[gazeData.length - 1] : null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
      {last && (
        <div
          style={{
            position: "absolute",
            top: last.y,
            left: last.x,
            width: "12px",
            height: "12px",
            backgroundColor: "red",
            borderRadius: "50%",
            pointerEvents: "none",
            boxShadow: "0 0 6px rgba(0,0,0,0.3)"
          }}
        />
      )}
    </div>
  );
}
