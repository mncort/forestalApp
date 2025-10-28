import {
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto
} from '@/lib/api/index';
import toast from 'react-hot-toast';

/**
 * Hook para manejar el guardado de cambios del presupuesto
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @param {boolean} hasUnsavedChanges - Si hay cambios sin guardar
 * @param {Object} pendingChanges - Cambios pendientes
 * @param {Function} setPendingChanges - Setter para cambios pendientes
 * @param {Function} setHasUnsavedChanges - Setter para flag de cambios
 * @param {Function} setSaving - Setter para estado de guardando
 * @param {Function} cargarItems - Función para recargar items
 * @param {Function} onSaved - Callback cuando se guardan cambios
 * @returns {Object} Funciones de guardado
 */
export function usePresupuestoItemsSave(
  presupuesto,
  hasUnsavedChanges,
  pendingChanges,
  setPendingChanges,
  setHasUnsavedChanges,
  setSaving,
  cargarItems,
  onSaved
) {
  /**
   * Guarda todos los cambios pendientes del presupuesto
   */
  const guardarCambios = async () => {
    if (!hasUnsavedChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      // 1. Actualizar campo efectivo si cambió
      if (pendingChanges.efectivo !== null) {
        await actualizarPresupuesto(presupuesto.id, {
          efectivo: pendingChanges.efectivo
        });
      }

      // 2. Eliminar items
      for (const itemId of pendingChanges.itemsToDelete) {
        await eliminarPresupuestoItem(itemId);
      }

      // 3. Actualizar items
      for (const item of pendingChanges.itemsToUpdate) {
        await actualizarPresupuestoItem(item.id, {
          Cantidad: item.Cantidad
        });
      }

      // 4. Crear items nuevos
      for (const item of pendingChanges.itemsToAdd) {
        await crearPresupuestoItem({
          nc_1g29___Presupuestos_id: presupuesto.id,
          nc_1g29__Productos_id: item.fields.nc_1g29__Productos_id.id,
          Cantidad: item.fields.Cantidad,
          PrecioUnitario: item.fields.PrecioUnitario,
          Markup: item.fields.Markup,
          Moneda: item.fields.Moneda
        });
      }

      // Reset pending changes y recargar items
      setPendingChanges({
        efectivo: null,
        itemsToAdd: [],
        itemsToUpdate: [],
        itemsToDelete: []
      });
      setHasUnsavedChanges(false);

      // Recargar items para obtener los datos frescos
      await cargarItems();

      toast.success('Cambios guardados correctamente');
      onSaved();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return {
    guardarCambios
  };
}
