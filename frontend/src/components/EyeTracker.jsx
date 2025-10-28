import React, { useEffect } from 'react';
import { loadWebgazer } from '../hooks/useWebgazer';

const EyeTracker = () => {
  useEffect(() => {
    loadWebgazer().then((webgazer) => {
      webgazer.setRegression("ridge")
        .setGazeListener((data, timestamp) => {
          if (data) {
            console.log(`Gaze at x:${data.x}, y:${data.y}`);
          }
        })
        .begin();

      // Espera a que el video esté en el DOM
      const interval = setInterval(() => {
        const video = document.getElementById("webgazerVideoFeed");
        if (video) {
          video.style.position = "fixed";
          video.style.bottom = "20px";
          video.style.right = "20px";
          video.style.width = "180px";
          video.style.zIndex = "9999";
          video.style.cursor = "move";
          video.setAttribute("draggable", "true");

          // Hacerlo movible
          video.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", null);
            const rect = video.getBoundingClientRect();
            video.dataset.offsetX = e.clientX - rect.left;
            video.dataset.offsetY = e.clientY - rect.top;
          });

          document.addEventListener("dragover", (e) => {
            e.preventDefault();
          });

          document.addEventListener("drop", (e) => {
            e.preventDefault();
            const offsetX = parseInt(video.dataset.offsetX || "0", 10);
            const offsetY = parseInt(video.dataset.offsetY || "0", 10);
            video.style.left = `${e.clientX - offsetX}px`;
            video.style.top = `${e.clientY - offsetY}px`;
            video.style.right = "auto";
            video.style.bottom = "auto";
          });

          clearInterval(interval);
        }
      }, 500);
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
