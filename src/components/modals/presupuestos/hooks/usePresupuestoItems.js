import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto,
  calcularPrecioProducto
} from '@/lib/api/index';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar la lógica de items de presupuesto
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @param {boolean} show - Si el modal está visible
 * @param {Array} categorias - Lista de categorías
 * @param {Array} subcategorias - Lista de subcategorías
 * @param {Array} costos - Lista de costos de productos
 * @param {Function} onSaved - Callback cuando se guardan cambios
 */
export function usePresupuestoItems(presupuesto, show, categorias, subcategorias, costos, onSaved) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  // Si el campo efectivo no existe (presupuestos viejos), usar true como default (medio IVA)
  // Si existe explícitamente, convertir a booleano (NocoDB devuelve 0/1)
  const [efectivo, setEfectivo] = useState(
    presupuesto?.fields?.efectivo !== undefined ? Boolean(presupuesto.fields.efectivo) : true
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    efectivo: null,
    itemsToAdd: [],
    itemsToUpdate: [],
    itemsToDelete: []
  });

  // Ref para rastrear si es la primera carga
  const isInitialMount = useRef(true);

  // Cargar items cuando se abre el modal
  useEffect(() => {
    if (show && presupuesto) {
      cargarItems();
      // Usar el valor real del presupuesto, o true por defecto si no existe
      // NocoDB devuelve checkbox como número (0/1), convertir a booleano
      const efectivoValue = presupuesto?.fields?.efectivo !== undefined
        ? Boolean(presupuesto.fields.efectivo)
        : true;
      setEfectivo(efectivoValue);
      setPendingChanges({
        efectivo: null,
        itemsToAdd: [],
        itemsToUpdate: [],
        itemsToDelete: []
      });
      setHasUnsavedChanges(false);
      isInitialMount.current = true;
    }
  }, [show, presupuesto]);

  // Detectar cambio en el campo efectivo
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

  const agregarItem = useCallback((producto, cantidad, productos) => {
    if (!producto || cantidad <= 0) return false;

    const subcategoria = subcategorias.find(s => s.id == producto.fields?.Subcategoria?.id);
    const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;

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
