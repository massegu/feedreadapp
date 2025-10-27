import React, { useEffect } from 'react';
import { loadWebgazer } from '../hooks/useWebgazer';

const EyeTracker = () => {
  useEffect(() => {
    loadWebgazer().then((webgazer) => {
      webgazer.setRegression('ridge')
        .setGazeListener((data, timestamp) => {
          if (data) {
            console.log(`Gaze at x:${data.x}, y:${data.y}`);
          }
        })
        .begin();
    });

    return () => {
      if (window.webgazer) window.webgazer.end();
    };
  }, []);

  return (
    <div>
      <p>Seguimiento ocular activado. Mira el texto mientras lees.</p>
    </div>
  );
};

export default EyeTracker;

