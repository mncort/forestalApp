import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar paginación de datos
 *
 * @param {Function} fetchFunction - Función async que obtiene los datos paginados
 *                                   Debe aceptar { limit, offset, ...additionalOptions } como parámetros
 * @param {Function} countFunction - Función async que obtiene el total de registros
 *                                   Debe aceptar { ...additionalOptions } como parámetros
 * @param {number} initialItemsPerPage - Cantidad inicial de items por página (default: 10)
 * @param {Array} dependencies - Dependencias adicionales que fuerzan recarga (default: [])
 * @param {Object} additionalOptions - Opciones adicionales para pasar a fetch y count (ej: filtros where)
 *
 * @returns {Object} Estado y funciones de paginación
 */
export function usePagination(
  fetchFunction,
  countFunction,
  initialItemsPerPage = 10,
  dependencies = [],
  additionalOptions = {}
) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(initialItemsPerPage);
  const [datos, setDatos] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usar ref para guardar las opciones previas y detectar cambios reales
  const prevOptionsRef = useRef();

  // Resetear a página 1 cuando cambien las opciones adicionales (filtros)
  useEffect(() => {
    const currentOptions = JSON.stringify(additionalOptions);
    const prevOptions = prevOptionsRef.current;

    if (prevOptions !== undefined && prevOptions !== currentOptions) {
      setPaginaActual(1);
    }

    prevOptionsRef.current = currentOptions;
  }, [additionalOptions]);

  // Función para cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (paginaActual - 1) * itemsPorPagina;

      const [datosResult, countResult] = await Promise.all([
        fetchFunction({ limit: itemsPorPagina, offset, ...additionalOptions }),
        countFunction(additionalOptions)
      ]);

      setDatos(datosResult);
      setTotalItems(countResult);
    } catch (err) {
      console.error('Error cargando datos paginados:', err);
      setError(err.message || 'Error al cargar los datos');
      setDatos([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, countFunction, paginaActual, itemsPorPagina, JSON.stringify(additionalOptions)]);

  // Cargar datos cuando cambien las dependencias
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Calcular información de paginación
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, totalItems);

  // Función para cambiar de página
  const irAPagina = useCallback((numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
    }
  }, [totalPaginas]);

  // Función para ir a la primera página
  const irAPrimeraPagina = useCallback(() => {
    setPaginaActual(1);
  }, []);

  // Función para ir a la última página
  const irAUltimaPagina = useCallback(() => {
    setPaginaActual(totalPaginas);
  }, [totalPaginas]);

  // Función para ir a la página anterior
  const irAPaginaAnterior = useCallback(() => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  }, [paginaActual]);

  // Función para ir a la página siguiente
  const irAPaginaSiguiente = useCallback(() => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  }, [paginaActual, totalPaginas]);

  // Función para cambiar items por página (resetea a página 1)
  const cambiarItemsPorPagina = useCallback((nuevoItemsPorPagina) => {
    setItemsPorPagina(nuevoItemsPorPagina);
    setPaginaActual(1);
  }, []);

  // Función para recargar datos
  const recargar = useCallback(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    // Datos
    datos,
    loading,
    error,

    // Información de paginación
    paginaActual,
    itemsPorPagina,
    totalItems,
    totalPaginas,
    inicio,
    fin,

    // Estado de navegación
    hayPaginaAnterior: paginaActual > 1,
    hayPaginaSiguiente: paginaActual < totalPaginas,

    // Funciones de navegación
    irAPagina,
    irAPrimeraPagina,
    irAUltimaPagina,
    irAPaginaAnterior,
    irAPaginaSiguiente,
    cambiarItemsPorPagina,

    // Función de recarga
    recargar
  };
}
