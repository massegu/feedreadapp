// src/hooks/useWebgazer.js
export const loadWebgazer = () => {
  return new Promise((resolve, reject) => {
    if (window.webgazer) {
      resolve(window.webgazer);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://webgazer.cs.brown.edu/webgazer.js";
    script.async = true;
    script.onload = () => resolve(window.webgazer);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};
