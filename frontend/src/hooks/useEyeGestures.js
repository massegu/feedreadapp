// useEyeGestures.js
import { useEffect, useRef } from "react";

export function useEyeGestures(onGaze) {
  const eyeRef = useRef(null);

  useEffect(() => {
    async function init() {
      const EyeGestures = await import("eyegestures"); // o la forma que indique su SDK
      const eye = await EyeGestures.init();
      eye.on("gaze", onGaze);
      eyeRef.current = eye;
    }

    init();

    return () => {
      eyeRef.current?.stop();
    };
  }, [onGaze]);

  return {
    isTracking: () => eyeRef.current?.isTracking?.() ?? false
  };
}
