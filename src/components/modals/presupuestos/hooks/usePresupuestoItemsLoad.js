import { useEffect } from 'react';
import { getItemsByPresupuesto } from '@/services/index';
import toast from 'react-hot-toast';

/**
 * Hook para manejar la carga de items del presupuesto
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @param {boolean} show - Si el modal está visible
 * @param {Function} setItems - Setter para actualizar items
 * @param {Function} setLoadingItems - Setter para estado de loading
 * @param {Function} resetState - Función para resetear el estado
 * @returns {Object} Funciones de carga
 */
export function usePresupuestoItemsLoad(
  presupuesto,
  show,
  setItems,
  setLoadingItems,
  resetState
) {
  /**
   * Carga los items del presupuesto desde la API
   */
  const cargarItems = async () => {
    if (!presupuesto) return;

    setLoadingItems(true);
    try {
      const itemsData = await getItemsByPresupuesto(presupuesto.id);
      setItems(itemsData);
    } catch (error) {
      console.error('Error cargando items:', error);
      toast.error('Error al cargar los items del presupuesto');
    } finally {
      setLoadingItems(false);
    }
  };

  // Cargar items cuando se abre el modal
  useEffect(() => {
    if (show && presupuesto) {
      cargarItems();
      resetState();
    }
  }, [show, presupuesto]);

  return {
    cargarItems
  };
}
