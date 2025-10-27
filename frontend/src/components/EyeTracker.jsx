import React, { useEffect } from 'react';
import webgazer from 'webgazer';

const EyeTracker = () => {
  useEffect(() => {
    webgazer.setRegression('ridge')
      .setGazeListener((data, timestamp) => {
        if (data) {
          console.log(`Gaze at x:${data.x}, y:${data.y}`);
        }
      })
      .begin();

    return () => {
      webgazer.end();
    };
  }, []);

  return (
    <div>
      <p>Seguimiento ocular activado. Mira el texto mientras lees.</p>
    </div>
  );
};

export default EyeTracker;
