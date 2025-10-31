import { useEffect, useRef } from "react";
import webgazer from "webgazer";

export function useWebGazer(onGaze) {
  const gazeRef = useRef(null);

useEffect(() => {
  async function startWebGazer() {
    await webgazer.begin();

    const video = document.getElementById("webgazerVideoFeed");
    const waitUntilReady = () =>
      new Promise((resolve) => {
        const check = () => {
          if (video?.videoWidth > 0 && video?.videoHeight > 0) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });

    await waitUntilReady();

    webgazer.setGazeListener((data, timestamp) => {
      if (data) onGaze(data);
    });

    webgazer.showVideoPreview(true).showPredictionPoints(true);
  }

  startWebGazer();

  return () => {
    webgazer.end();
  };
}, [onGaze]);

  return {
    isTracking: () => gazeRef.current?.isReady ?? false
  };
}


