import React from "react";

export default function EyeTracker({ gazeData = [] }) {
  const last = gazeData.length > 0 ? gazeData[gazeData.length - 1] : null;

  // Validar que el punto esté dentro del viewport
  const isValid =
    last &&
    typeof last.x === "number" &&
    typeof last.y === "number" &&
    last.x >= 0 &&
    last.y >= 0 &&
    last.x <= window.innerWidth &&
    last.y <= window.innerHeight;

  console.log("Último punto:", last);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
      {isValid && (
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


