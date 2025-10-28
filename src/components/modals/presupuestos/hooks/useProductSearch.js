import { useState, useEffect } from 'react';
import { getProductos, countProductos } from '@/lib/api/index';

/**
 * Hook para manejar la búsqueda de productos con debounce
 *
 * @param {boolean} isActive - Si la búsqueda está activa
 * @param {number} debounceMs - Tiempo de debounce en milisegundos
 */
export function useProductSearch(isActive = false, debounceMs = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [totalProductos, setTotalProductos] = useState(0);

  // Cargar productos iniciales cuando se activa
  useEffect(() => {
    if (isActive) {
      buscarProductos('');
    }
  }, [isActive]);

  // Buscar productos con debounce
  useEffect(() => {
    if (!isActive) return;

    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isActive]);

  const buscarProductos = async (termino) => {
    setLoadingProductos(true);
    try {
      let opciones = { limit: 25 };

      if (termino && termino.trim() !== '') {
        // Limpiar el término de búsqueda
        const terminoLimpio = termino.trim().replace(/"/g, '_');
        opciones.where = `(Nombre,like,%${terminoLimpio}%)~or(SKU,like,%${terminoLimpio}%)`;
      }

      // Obtener productos
      const prods = await getProductos(opciones);

      // Obtener count
      let count = 0;
      try {
        count = await countProductos(opciones.where ? { where: opciones.where } : {});
      } catch (e) {
        console.warn('Error al contar productos:', e);
        count = prods.length;
      }

      setProductos(prods);
      setTotalProductos(count);
    } catch (error) {
      console.error('Error buscando productos:', error);
      setProductos([]);
      setTotalProductos(0);
    } finally {
      setLoadingProductos(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    productos,
    loadingProductos,
    totalProductos
  };
}
