import React, { useEffect, useState } from 'react';

const TextReader = ({ text }) => {
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    const start = Date.now();
    setStartTime(start);

    return () => {
      const end = Date.now();
      const seconds = ((end - start) / 1000).toFixed(2);
      setDuration(seconds);
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

