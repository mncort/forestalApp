import { useState, useCallback } from 'react';
import { esEditable, ESTADOS_PRESUPUESTO } from '@/lib/stateMachine/presupuestoStates';
import toast from 'react-hot-toast';

/**
 * Hook para gestionar el estado de un presupuesto
 * @param {Object} presupuesto - Presupuesto actual
 * @param {Function} onEstadoChanged - Callback cuando cambia el estado
 * @returns {Object} Estados y funciones para gestionar el estado del presupuesto
 */
export const usePresupuestoEstado = (presupuesto, onEstadoChanged) => {
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Si no hay presupuesto (modo creación), usar valores por defecto
  const estadoActual = presupuesto?.fields?.Estado || ESTADOS_PRESUPUESTO.BORRADOR;
  const editable = !presupuesto || esEditable(estadoActual); // En modo creación siempre es editable
  const tienePDF = presupuesto?.fields?.PDF && presupuesto.fields.PDF.length > 0;

  /**
   * Cambia el estado del presupuesto
   * @param {string} nuevoEstado - Nuevo estado
   */
  const cambiarEstado = useCallback(async (nuevoEstado) => {
    if (!presupuesto?.id) {
      toast.error('No hay presupuesto seleccionado');
      return false;
    }

    const mensajes = {
      Enviado: '¿Confirma enviar este presupuesto? Se generará un PDF y no podrá editarse después.',
      Aprobado: '¿Confirma aprobar este presupuesto?',
      Rechazado: '¿Confirma rechazar este presupuesto?',
    };

    if (!confirm(mensajes[nuevoEstado] || `¿Confirma cambiar el estado a "${nuevoEstado}"?`)) {
      return false;
    }

    setCambiandoEstado(true);

    try {
      const response = await fetch(`/api/presupuestos/${presupuesto.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar estado');
      }

      const result = await response.json();

      toast.success(result.mensaje || 'Estado actualizado correctamente');

      if (onEstadoChanged) {
        await onEstadoChanged();
      }

      return true;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.message);
      return false;
    } finally {
      setCambiandoEstado(false);
    }
  }, [presupuesto, onEstadoChanged]);

  /**
   * Visualiza el PDF del presupuesto
   * - En borrador: genera preview temporal
   * - En otros estados: descarga el PDF guardado
   * Abre el PDF en un modal en lugar de nueva ventana
   */
  const verPDF = useCallback(async () => {
    if (!presupuesto?.id) {
      toast.error('No hay presupuesto seleccionado');
      return;
    }

    setGenerandoPDF(true);

    try {
      let url;

      if (estadoActual === ESTADOS_PRESUPUESTO.BORRADOR) {
        // Preview temporal
        url = `/api/presupuestos/${presupuesto.id}/pdf/preview`;
      } else {
        // PDF guardado
        url = `/api/presupuestos/${presupuesto.id}/pdf`;
      }

      // Establecer URL y abrir modal
      setPdfUrl(url);
      setShowPDFModal(true);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  }, [presupuesto, estadoActual]);

  /**
   * Cierra el modal de PDF
   */
  const cerrarPDFModal = useCallback(() => {
    setShowPDFModal(false);
    setPdfUrl(null);
  }, []);

  return {
    estadoActual,
    esEditable: editable,
    tienePDF,
    cambiandoEstado,
    generandoPDF,
    cambiarEstado,
    verPDF,
    // Estados del modal de PDF
    pdfUrl,
    showPDFModal,
    cerrarPDFModal,
  };
};
