
---

## 🧩 Módulo de lectura silenciosa – `TextReader.jsx`

```jsx
// TextReader.jsx
import React, { useEffect, useState } from 'react';

const TextReader = ({ text }) => {
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
    return () => {
      const endTime = Date.now();
      setDuration(((endTime - startTime) / 1000).toFixed(2));
    };
  }, []);

  return (
    <div>
      <h2>Lee el siguiente texto:</h2>
      <p>{text}</p>
      {duration && <p>Tiempo de lectura: {duration} segundos</p>}
    </div>
  );
};

export default TextReader;
