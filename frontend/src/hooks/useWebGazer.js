import { useEffect, useRef } from "react";
import webgazer from "webgazer";

export function useWebGazer(onGaze) {
  const gazeRef = useRef(null);
  const monitorRef = useRef(null);

  useEffect(() => {
    async function startWebGazer() {
      await webgazer.showVideoPreview(true).showPredictionPoints(true).begin();
      gazeRef.current = webgazer;

      webgazer.setGazeListener((data, timestamp) => {
        if (data?.x && data?.y) {
          onGaze(data);
        }
      });

      // 🔍 Vigilancia activa del video
      monitorRef.current = setInterval(() => {
        const video = document.getElementById("webgazerVideoFeed");
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("⚠️ Video inactivo. Reiniciando WebGazer...");
          webgazer.end().then(() => {
            webgazer.showVideoPreview(true).showPredictionPoints(true).begin();
          });
        }
      }, 3000); // cada 3 segundos
    }

    startWebGazer();

    return () => {
      clearInterval(monitorRef.current);
      try {
        webgazer.end();
      } catch (err) {
        console.warn("Error al cerrar WebGazer:", err);
      }
    };
  }, [onGaze]);

  return {
    isTracking: () => gazeRef.current?.isReady ?? false
  };
}
