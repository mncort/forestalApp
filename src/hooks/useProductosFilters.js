import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para gestionar el estado de los filtros de productos
 * @returns {Object} Estado y funciones para gestionar filtros
 */
export const useProductosFilters = () => {
  const [filters, setFilters] = useState({
    searchText: '', // Búsqueda por nombre de producto o SKU
    categorias: [], // Array de IDs de categorías seleccionadas
    subcategorias: [], // Array de IDs de subcategorías seleccionadas
  });

  // Estado temporal para el input de búsqueda (con debounce)
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
   * Agrega una categoría a la selección
   */
  const addCategoria = useCallback((categoriaId) => {
    setFilters(prev => ({
      ...prev,
      categorias: [...prev.categorias, categoriaId]
    }));
  }, []);

  /**
   * Remueve una categoría de la selección
   */
  const removeCategoria = useCallback((categoriaId) => {
    setFilters(prev => ({
      ...prev,
      categorias: prev.categorias.filter(id => id !== categoriaId)
    }));
  }, []);

  /**
   * Toggle de categoría (agregar si no está, remover si está)
   */
  const toggleCategoria = useCallback((categoriaId) => {
    setFilters(prev => {
      const isSelected = prev.categorias.includes(categoriaId);
      return {
        ...prev,
        categorias: isSelected
          ? prev.categorias.filter(id => id !== categoriaId)
          : [...prev.categorias, categoriaId]
      };
    });
  }, []);

  /**
   * Toggle de subcategoría (agregar si no está, remover si está)
   */
  const toggleSubcategoria = useCallback((subcategoriaId) => {
    setFilters(prev => {
      const isSelected = prev.subcategorias.includes(subcategoriaId);
      return {
        ...prev,
        subcategorias: isSelected
          ? prev.subcategorias.filter(id => id !== subcategoriaId)
          : [...prev.subcategorias, subcategoriaId]
      };
    });
  }, []);

  /**
   * Limpia todos los filtros a su estado inicial
   */
  const clearFilters = useCallback(() => {
    setSearchInput('');
    setFilters({
      searchText: '',
      categorias: [],
      subcategorias: [],
    });
  }, []);

  /**
   * Verifica si hay algún filtro activo
   */
  const hasActiveFilters = useCallback(() => {
    return filters.searchText !== '' ||
           filters.categorias.length > 0 ||
           filters.subcategorias.length > 0;
  }, [filters]);

  return {
    filters,
    searchInput, // Retornar el input temporal para usar en el componente
    updateFilter,
    toggleCategoria,
    toggleSubcategoria,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
};
