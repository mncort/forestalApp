'use client'
import { createContext, useContext } from 'react';
import { useNocoDB } from '@/hooks/useNocoDB';
import { getCategorias, getSubcategorias, getCostos } from '@/services/index';

/**
 * Context para datos del catálogo que no cambian frecuentemente
 * (categorías, subcategorías, costos)
 *
 * Estos datos se cargan UNA SOLA VEZ cuando se monta el provider
 * y quedan disponibles para toda la aplicación
 */
const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  // Cargar datos usando el hook useNocoDB
  const {
    data: categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    reload: reloadCategorias
  } = useNocoDB(getCategorias);

  const {
    data: subcategorias,
    loading: loadingSubcategorias,
    error: errorSubcategorias,
    reload: reloadSubcategorias
  } = useNocoDB(getSubcategorias);

  const {
    data: costos,
    loading: loadingCostos,
    error: errorCostos,
    reload: reloadCostos
  } = useNocoDB(getCostos);

  // Estados de carga combinados
  const loading = loadingCategorias || loadingSubcategorias || loadingCostos;
  const error = errorCategorias || errorSubcategorias || errorCostos;

  // Función para recargar todos los datos
  const reloadAll = () => {
    reloadCategorias();
    reloadSubcategorias();
    reloadCostos();
  };

  const value = {
    categorias: categorias || [],
    subcategorias: subcategorias || [],
    costos: costos || [],
    loading,
    error,
    reload: reloadAll
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

/**
 * Hook para usar el catálogo en cualquier componente
 * @returns {Object} { categorias, subcategorias, costos, loading, error, reload }
 */
export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog debe usarse dentro de un CatalogProvider');
  }

  return context;
}
