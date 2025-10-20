// frontend/src/components/UserCounter.jsx
import React, { useEffect, useState } from 'react';

const UserCounter = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/register-user')
      .then(res => res.json())
      .then(data => setCount(data.user_count));
  }, []);

  return (
    <p>👥 Número de personas que han probado la app: {count}</p>
  );
};

export default UserCounter;
