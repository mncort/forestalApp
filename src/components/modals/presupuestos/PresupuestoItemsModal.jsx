'use client'
import { useState } from 'react';
import { Plus, Save, X, Printer } from 'lucide-react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useCatalog } from '@/context/CatalogContext';
import { usePresupuestoItems } from './hooks/usePresupuestoItems';
import { usePresupuestoCalculations } from './hooks/usePresupuestoCalculations';
import ProductSearchModal from './components/ProductSearchModal';
import PresupuestoItemsTable from './components/PresupuestoItemsTable';
import PresupuestoTotals from './components/PresupuestoTotals';
import PresupuestoPDF from '@/components/pdf/PresupuestoPDF';
import { prepararDatosPresupuesto } from '@/lib/pdf/formatters';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

/**
 * Modal refactorizado para gestionar items de presupuesto
 * Versión mejorada con componentes modulares y lógica separada en hooks
 */
export default function PresupuestoItemsModal({ show, presupuesto, onClose, onSaved }) {
  // Contexto del catálogo
  const { categorias, subcategorias, costos } = useCatalog();

  // Estados locales del modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  // Hook principal de gestión de items
  const {
    items,
    loadingItems,
    saving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    guardarCambios
  } = usePresupuestoItems(presupuesto, show, categorias, subcategorias, costos, onSaved);

  // Hook de cálculos
  const { itemsConPrecios, totales } = usePresupuestoCalculations(items, efectivo);

  // Manejadores
  const handleAgregarProducto = (producto, cantidad, productos) => {
    const success = agregarItem(producto, cantidad, productos);
    if (success) {
      toast.success('Producto agregado correctamente');
    }
    return success;
  };

  const handleEliminarItem = (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;
    eliminarItem(itemId);
    toast.success('Item eliminado');
  };

  const handleGenerarPDF = () => {
    try {
      if (!presupuesto) {
        toast.error('No hay presupuesto seleccionado');
        return;
      }

      if (itemsConPrecios.length === 0) {
        toast.error('El presupuesto no tiene items');
        return;
      }

      const datos = prepararDatosPresupuesto(presupuesto, itemsConPrecios, efectivo);
      setPdfData(datos);
      setShowPDFModal(true);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error(`Error al generar PDF: ${error.message}`);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!confirm('Hay cambios sin guardar. ¿Deseas salir sin guardar?')) {
        return;
      }
    }
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* Modal principal */}
      <div className="modal modal-open">
        <div className="modal-box max-w-6xl h-[90vh] flex flex-col p-0">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-base-300">
            <div>
              <h3 className="font-bold text-xl">
                Items del Presupuesto
              </h3>
              <p className="text-sm text-base-content/60 mt-1">
                Cliente: {presupuesto?.fields?.ClienteCompleto?.Nombre || 'Sin cliente'}
                {presupuesto?.fields?.Descripcion && ` - ${presupuesto.fields.Descripcion}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabla de items (2/3) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Productos</h4>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <Plus size={16} />
                    Agregar Producto
                  </button>
                </div>

                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-0">
                    <PresupuestoItemsTable
                      items={items}
                      itemsConPrecios={itemsConPrecios}
                      onCantidadChange={actualizarCantidad}
                      onEliminarItem={handleEliminarItem}
                      loading={loadingItems}
                    />
                  </div>
                </div>
              </div>

              {/* Totales (1/3) */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Resumen</h4>
                <PresupuestoTotals
                  totales={totales}
                  efectivo={efectivo}
                  onEfectivoChange={setEfectivo}
                />
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-base-300 p-6 bg-base-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={handleGenerarPDF}
                  className="btn btn-outline gap-2"
                  disabled={items.length === 0}
                >
                  <Printer size={18} />
                  Ver PDF
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="btn btn-ghost"
                >
                  {hasUnsavedChanges ? 'Cancelar' : 'Cerrar'}
                </button>
                <button
                  onClick={guardarCambios}
                  className="btn btn-primary gap-2"
                  disabled={!hasUnsavedChanges || saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="alert alert-warning mt-4">
                <span className="text-sm">Hay cambios sin guardar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de agregar producto */}
      <ProductSearchModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAgregarProducto}
      />

      {/* Modal de PDF */}
      {showPDFModal && pdfData && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <h3 className="font-bold text-lg">Vista Previa del Presupuesto</h3>
              <div className="flex gap-2">
                <PDFDownloadLink
                  document={<PresupuestoPDF data={pdfData} />}
                  fileName={`presupuesto-${presupuesto.id}.pdf`}
                  className="btn btn-primary btn-sm"
                >
                  {({ loading }) => (loading ? 'Generando...' : 'Descargar PDF')}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowPDFModal(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer className="w-full h-full">
                <PresupuestoPDF data={pdfData} />
              </PDFViewer>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
