'use client'
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar la lógica de carga de datos desde NocoDB
 * Elimina código duplicado de loading, error y fetch
 *
 * @param {Function} fetchFunction - Función async que retorna los datos
 * @param {Array} dependencies - Dependencias para recargar (opcional)
 * @returns {Object} { data, loading, error, reload }
 */
export function useNocoDB(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error('Error en useNocoDB:', err);
      setError(err.message || 'Error al conectar con NocoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    reload: loadData
  };
}

/**
 * Hook para cargar múltiples recursos en paralelo
 *
 * @param {Object} fetchFunctions - Objeto con funciones de fetch { key: fetchFunction }
 * @returns {Object} { data, loading, error, reload }
 */
export function useNocoDBMultiple(fetchFunctions) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = Object.keys(fetchFunctions);
      const promises = keys.map(key => fetchFunctions[key]());
      const results = await Promise.all(promises);

      const dataObject = {};
      keys.forEach((key, index) => {
        dataObject[key] = results[index];
      });

      setData(dataObject);
    } catch (err) {
      console.error('Error en useNocoDBMultiple:', err);
      setError(err.message || 'Error al conectar con NocoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    reload: loadData
  };
}
