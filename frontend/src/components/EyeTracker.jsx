// EyeTracker.jsx
import React, { useEffect } from 'react';

const EyeTracker = () => {
  useEffect(() => {
    const loadWebGazer = async () => {
      await import('webgazer');
      window.webgazer.setRegression('ridge')
        .setGazeListener((data, timestamp) => {
          if (data) {
            console.log(`Gaze at x:${data.x}, y:${data.y}`);
          }
        })
        .begin();
    };
    loadWebGazer();
    return () => window.webgazer.end();
  }, []);

  return (
    <div>
      <p>Seguimiento ocular activado. Mira el texto mientras lees.</p>
    </div>
  );
};

export default EyeTracker;
