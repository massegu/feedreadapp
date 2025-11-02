// frontend/src/components/UserCounter.jsx
import React, { useEffect, useState } from 'react';
import API_BASE_URL from "../config/api";

const UserCounter = () => {
  const [count, setCount] = useState(null);

   useEffect(() => {
    // Solo registrar si el usuario no ha sido contado antes
    if (!localStorage.getItem('user_registered')) {
      fetch(`${API_BASE_URL}/register-user`)
        .then(res => res.json())
        .then(data => {
          setCount(data.user_count);
          localStorage.setItem('user_registered', 'true');
        });
    } else {
      // Si ya fue contado, puedes mostrar el número actual o dejarlo vacío
      setCount('Ya registrado');
    }
  }, []);

  return (
    <p>👥 Número de personas que han probado la app: {count}</p>
  );
  };

export default UserCounter;
