import { useCallback } from 'react';
import { calcularPrecioProducto } from '@/lib/api/index';
import toast from 'react-hot-toast';

/**
 * Hook para manejar las acciones sobre los items (agregar, eliminar, actualizar)
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @param {Array} items - Items actuales
 * @param {Function} setItems - Setter para actualizar items
 * @param {Array} categorias - Lista de categorías
 * @param {Array} subcategorias - Lista de subcategorías
 * @param {Array} costos - Lista de costos
 * @param {Function} setPendingChanges - Setter para cambios pendientes
 * @param {Function} setHasUnsavedChanges - Setter para flag de cambios
 * @returns {Object} Funciones de acciones
 */
export function usePresupuestoItemsActions(
  presupuesto,
  items,
  setItems,
  categorias,
  subcategorias,
  costos,
  setPendingChanges,
  setHasUnsavedChanges
) {
  /**
   * Agrega un nuevo item al presupuesto
   */
  const agregarItem = useCallback((producto, cantidad) => {
    if (!producto || cantidad <= 0) return false;

    const subcategoria = subcategorias.find(
      s => s.id == producto.fields?.Subcategoria?.id
    );
    const categoria = subcategoria
      ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id)
      : null;

    // Calcular precio con markup
    const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

    if (!precioCalc.tieneCosto) {
      toast.error('Este producto no tiene un costo asignado');
      return false;
    }

    // Crear nuevo item
    const nuevoItem = {
      id: `temp-${Date.now()}`,
      isNew: true,
      fields: {
        nc_1g29___Presupuestos_id: presupuesto.id,
        nc_1g29__Productos_id: {
          id: producto.id,
          Nombre: producto.fields.Nombre,
          SKU: producto.fields.SKU,
          Descripcion: producto.fields.Descripcion,
          Subcategoria: producto.fields.Subcategoria,
          Markup: producto.fields.Markup
        },
        Cantidad: cantidad,
        PrecioUnitario: precioCalc.precioVenta,
        Markup: precioCalc.markup,
        Moneda: precioCalc.moneda
      }
    };

    setItems(prev => [...prev, nuevoItem]);
    setPendingChanges(prev => ({
      ...prev,
      itemsToAdd: [...prev.itemsToAdd, nuevoItem]
    }));
    setHasUnsavedChanges(true);

    return true;
  }, [presupuesto, categorias, subcategorias, costos]);

  /**
   * Elimina un item del presupuesto
   */
  const eliminarItem = useCallback((itemId) => {
    const item = items.find(i => i.id === itemId);

    // Si es un item nuevo (temporal), solo lo removemos
    if (item?.isNew) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToAdd: prev.itemsToAdd.filter(i => i.id !== itemId)
      }));
    } else {
      // Si es existente, lo marcamos para eliminar
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToDelete: [...prev.itemsToDelete, itemId]
      }));
    }

    setHasUnsavedChanges(true);
  }, [items]);

  /**
   * Actualiza la cantidad de un item
   */
  const actualizarCantidad = useCallback((itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;

    // Actualizar items locales
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          fields: {
            ...item.fields,
            Cantidad: nuevaCantidad
          }
        };
      }
      return item;
    }));

    // Agregar a cambios pendientes solo si no es un item nuevo
    const item = items.find(i => i.id === itemId);
    if (!item?.isNew) {
      setPendingChanges(prev => {
        const existingUpdate = prev.itemsToUpdate.find(i => i.id === itemId);
        if (existingUpdate) {
          return {
            ...prev,
            itemsToUpdate: prev.itemsToUpdate.map(i =>
              i.id === itemId ? { id: itemId, Cantidad: nuevaCantidad } : i
            )
          };
        }
        return {
          ...prev,
          itemsToUpdate: [...prev.itemsToUpdate, { id: itemId, Cantidad: nuevaCantidad }]
        };
      });
    }

    setHasUnsavedChanges(true);
  }, [items]);

  return {
    agregarItem,
    eliminarItem,
    actualizarCantidad
  };
}
