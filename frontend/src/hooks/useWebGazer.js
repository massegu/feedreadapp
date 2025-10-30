import { useEffect, useRef } from "react";
import webgazer from "webgazer";

export function useWebGazer(onGaze) {
  const gazeRef = useRef(null);

  useEffect(() => {
    webgazer.setGazeListener((data, timestamp) => {
      if (data) {
        console.log("Gaze data:", data); // 👈 Verifica que esto aparezca
        onGaze(data);
      }
    });

    webgazer.showVideoPreview(false).showPredictionPoints(true).begin();
    gazeRef.current = webgazer;

    return () => {
      webgazer.end();
    };
  }, [onGaze]);

  return {
    isTracking: () => gazeRef.current?.isReady ?? false
  };
}


