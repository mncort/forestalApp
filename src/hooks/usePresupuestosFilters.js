import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para gestionar el estado de los filtros de presupuestos
 * @returns {Object} Estado y funciones para gestionar filtros
 */
export const usePresupuestosFilters = () => {
  const [filters, setFilters] = useState({
    searchText: '', // Búsqueda por nombre de cliente o CUIT
    tipoPago: 'todos', // 'todos' | 'efectivo' | 'tarjeta'
    fechaDesde: '', // Fecha en formato YYYY-MM-DD
    fechaHasta: '', // Fecha en formato YYYY-MM-DD
  });

  // Estado temporal para el input de búsqueda (sin debounce)
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef(null);

  // Aplicar debounce solo al searchText
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        searchText: searchInput
      }));
    }, 500); // 500ms de delay

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = useCallback((key, value) => {
    // Si es searchText, actualizar el input temporal
    if (key === 'searchText') {
      setSearchInput(value);
    } else {
      // Otros filtros se actualizan inmediatamente
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  }, []);

  /**
   * Limpia todos los filtros a su estado inicial
   */
  const clearFilters = useCallback(() => {
    setSearchInput('');
    setFilters({
      searchText: '',
      tipoPago: 'todos',
      fechaDesde: '',
      fechaHasta: '',
    });
  }, []);

  /**
   * Verifica si hay algún filtro activo
   */
  const hasActiveFilters = useCallback(() => {
    return filters.searchText !== '' ||
           filters.tipoPago !== 'todos' ||
           filters.fechaDesde !== '' ||
           filters.fechaHasta !== '';
  }, [filters]);

  return {
    filters,
    searchInput, // Retornar el input temporal para usar en el componente
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
};
