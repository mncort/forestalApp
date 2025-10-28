import { useEffect } from 'react';
import { usePresupuestoItemsState } from './usePresupuestoItemsState';
import { usePresupuestoItemsLoad } from './usePresupuestoItemsLoad';
import { usePresupuestoItemsActions } from './usePresupuestoItemsActions';
import { usePresupuestoItemsSave } from './usePresupuestoItemsSave';

/**
 * Hook compuesto para manejar la lógica de items de presupuesto
 * Orquesta los diferentes sub-hooks especializados
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @param {boolean} show - Si el modal está visible
 * @param {Array} categorias - Lista de categorías
 * @param {Array} subcategorias - Lista de subcategorías
 * @param {Array} costos - Lista de costos de productos
 * @param {Function} onSaved - Callback cuando se guardan cambios
 */
export function usePresupuestoItems(presupuesto, show, categorias, subcategorias, costos, onSaved) {
  // 1. Estado
  const {
    items,
    setItems,
    loadingItems,
    setLoadingItems,
    saving,
    setSaving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pendingChanges,
    setPendingChanges,
    isInitialMount,
    resetState
  } = usePresupuestoItemsState(presupuesto);

  // 2. Carga de datos
  const { cargarItems } = usePresupuestoItemsLoad(
    presupuesto,
    show,
    setItems,
    setLoadingItems,
    resetState
  );

  // 3. Acciones
  const { agregarItem, eliminarItem, actualizarCantidad } = usePresupuestoItemsActions(
    presupuesto,
    items,
    setItems,
    categorias,
    subcategorias,
    costos,
    setPendingChanges,
    setHasUnsavedChanges
  );

  // 4. Guardado
  const { guardarCambios } = usePresupuestoItemsSave(
    presupuesto,
    hasUnsavedChanges,
    pendingChanges,
    setPendingChanges,
    setHasUnsavedChanges,
    setSaving,
    cargarItems,
    onSaved
  );

  // 5. Detectar cambio en el campo efectivo
  useEffect(() => {
    // Ignorar el primer render cuando se carga el modal
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Comparar convirtiendo ambos valores a booleano (NocoDB devuelve 0/1)
    const efectivoOriginal = presupuesto?.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields.efectivo)
      : true;

    if (presupuesto && efectivo !== efectivoOriginal) {
      setPendingChanges(prev => ({ ...prev, efectivo }));
      setHasUnsavedChanges(true);
    }
  }, [efectivo, presupuesto]);

  return {
    items,
    loadingItems,
    saving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    guardarCambios,
    recargarItems: cargarItems
  };
}
