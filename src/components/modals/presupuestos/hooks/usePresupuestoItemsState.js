import { useState, useRef } from 'react';

/**
 * Hook para manejar el estado de los items del presupuesto
 *
 * @param {Object} presupuesto - El presupuesto actual
 * @returns {Object} Estado y funciones para manejarlo
 */
export function usePresupuestoItemsState(presupuesto) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // Si el campo efectivo no existe (presupuestos viejos), usar true como default (medio IVA)
  // Si existe explícitamente, convertir a booleano (NocoDB devuelve 0/1)
  const [efectivo, setEfectivo] = useState(
    presupuesto?.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields.efectivo)
      : true
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

  /**
   * Resetea el estado a valores iniciales
   */
  const resetState = () => {
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
  };

  return {
    // Estado
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
    // Funciones
    resetState
  };
}
