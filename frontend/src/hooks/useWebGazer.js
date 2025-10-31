import { useEffect, useRef } from "react";
import webgazer from "webgazer";

export function useWebGazer(onGaze) {
  const gazeRef = useRef(null);
  const monitorRef = useRef(null);

  useEffect(() => {
    async function startWebGazer() {
      await webgazer.showVideoPreview(true).showPredictionPoints(true).begin();
      gazeRef.current = webgazer;

      const waitUntilVideoReady = () =>
        new Promise((resolve) => {
          const check = () => {
            const video = document.getElementById("webgazerVideoFeed");
      if (video?.videoWidth > 0 && video?.videoHeight > 0) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });

await webgazer.showVideoPreview(true).showPredictionPoints(true).begin();
await waitUntilVideoReady();

webgazer.setGazeListener((data, timestamp) => {
  if (data?.x && data?.y) {
    onGaze(data);
  }
});

await waitUntilVideoReady();


      webgazer.setGazeListener((data, timestamp) => {
        if (data?.x && data?.y) {
          onGaze(data);
        }
      });

      // 🔁 Vigilancia activa cada 3 segundos
      monitorRef.current = setInterval(() => {
        const video = document.getElementById("webgazerVideoFeed");
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("⚠️ Video inactivo. Reiniciando WebGazer...");
          webgazer.end().then(() => {
            webgazer.showVideoPreview(true).showPredictionPoints(true).begin();
          });
        }
      }, 3000);
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
