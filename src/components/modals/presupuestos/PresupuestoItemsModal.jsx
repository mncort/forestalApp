'use client'
import { useState } from 'react';
import { Plus, Save, X, Printer, Loader2, Download } from 'lucide-react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCatalog } from '@/context/CatalogContext';
import { usePresupuestoItems } from './hooks/usePresupuestoItems';
import { usePresupuestoCalculations } from './hooks/usePresupuestoCalculations';
import ProductSearchModal from './components/ProductSearchModal';
import PresupuestoItemsTable from './components/PresupuestoItemsTable';
import PresupuestoTotals from './components/PresupuestoTotals';
import PresupuestoPDF from '@/components/pdf/PresupuestoPDF';
import { prepararDatosPresupuesto } from '@/lib/pdf/formatters';
import toast from 'react-hot-toast';

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

  return (
    <>
      {/* Modal principal */}
      <Dialog open={show} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="border-b border-border p-6">
            <div>
              <DialogTitle className="text-xl">
                Items del Presupuesto
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cliente: {presupuesto?.fields?.ClienteCompleto?.Nombre || 'Sin cliente'}
                {presupuesto?.fields?.Descripcion && ` - ${presupuesto.fields.Descripcion}`}
              </p>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabla de items (2/3) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Productos</h4>
                  <Button
                    onClick={() => setShowAddProductModal(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Agregar Producto
                  </Button>
                </div>

                <div className="border border-border rounded-lg">
                  <PresupuestoItemsTable
                    items={items}
                    itemsConPrecios={itemsConPrecios}
                    onCantidadChange={actualizarCantidad}
                    onEliminarItem={handleEliminarItem}
                    loading={loadingItems}
                  />
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
          <div className="border-t border-border p-6 bg-muted">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerarPDF}
                  variant="outline"
                  disabled={items.length === 0}
                  className="gap-2"
                >
                  <Printer size={18} />
                  Ver PDF
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="ghost"
                >
                  {hasUnsavedChanges ? 'Cancelar' : 'Cerrar'}
                </Button>
                <Button
                  onClick={guardarCambios}
                  disabled={!hasUnsavedChanges || saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4 text-sm">
                <span>Hay cambios sin guardar</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de agregar producto */}
      <ProductSearchModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAgregarProducto}
      />

      {/* Modal de PDF */}
      <Dialog open={showPDFModal} onOpenChange={(open) => setShowPDFModal(open)}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border/50 space-y-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-semibold">Vista Previa del Presupuesto</DialogTitle>
              <div className="flex items-center gap-2 mr-8">
                {pdfData && presupuesto && (
                  <PDFDownloadLink
                    document={<PresupuestoPDF data={pdfData} />}
                    fileName={`presupuesto-${presupuesto.id}.pdf`}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg h-9 w-9"
                    title="Descargar PDF"
                  >
                    {({ loading }) => (
                      loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/20">
            {pdfData && (
              <PDFViewer className="w-full h-full border-0">
                <PresupuestoPDF data={pdfData} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
