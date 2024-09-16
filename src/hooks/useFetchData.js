import { useState, useEffect } from 'react';

const useFetchData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false); // Cambiar el estado inicial de loading a `false`
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    if (!url) return; // Si la URL es null, no hacemos el fetch

    const fetchData = async () => {
      setLoading(true); // Solo activamos el loading cuando hay una URL válida

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message); // Establecer mensaje de error
      } finally {
        setLoading(false); // Desactivar loading cuando se complete la llamada
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetchData;
