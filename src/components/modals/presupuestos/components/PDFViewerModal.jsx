'use client'
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

/**
 * Modal para visualizar PDFs
 * @param {boolean} show - Si el modal está visible
 * @param {string} pdfUrl - URL del PDF a mostrar
 * @param {string} title - Título del modal
 * @param {Function} onClose - Callback para cerrar el modal
 */
export default function PDFViewerModal({ show, pdfUrl, title, onClose }) {
  const handleDownload = () => {
    // Crear un link temporal para descargar
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'presupuesto.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Efecto para hacer transparente SOLO el overlay de este modal cuando hay múltiples
  useEffect(() => {
    if (show) {
      // Delays para verificar overlays en diferentes momentos
      const OVERLAY_CHECK_DELAYS = [0, 50, 100, 200];

      const handleOverlays = () => {
        // Buscar todos los divs fixed inset-0 (sin importar las clases específicas)
        const allFixed = Array.from(document.querySelectorAll('div[class*="fixed"]')).filter(el => {
          return el.className.includes('inset-0');
        });

        // Filtrar solo los que tienen background oscuro (overlays)
        const overlays = allFixed.filter(el => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          // Verificar si tiene algún background oscuro o semi-transparente
          return bg && (
            bg.includes('0, 0, 0') ||
            bg.includes('black') ||
            (bg.includes('rgba') && !bg.includes('rgba(0, 0, 0, 0)'))
          );
        });

        // Si hay 2 overlays, hacer transparente SOLO el segundo (índice 1)
        // Dejando el primero (índice 0) oscuro
        if (overlays.length >= 2) {
          // Asegurarnos de que el primer overlay mantenga su background
          overlays[0].style.removeProperty('background-color');
          overlays[0].style.removeProperty('backdrop-filter');

          // Hacer transparente el segundo overlay (el del PDF modal)
          overlays[1].style.setProperty('background-color', 'transparent', 'important');
          overlays[1].style.setProperty('backdrop-filter', 'none', 'important');
        }
      };

      // Ejecutar con delays progresivos para asegurar que el DOM esté listo
      const timers = OVERLAY_CHECK_DELAYS.map(delay => setTimeout(handleOverlays, delay));

      // Observar cambios en el DOM
      const observer = new MutationObserver(handleOverlays);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
        observer.disconnect();
      };
    }
  }, [show]);

  return (
    <Dialog open={show} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 z-[100]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title || 'Visualizar PDF'}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="mr-8"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hay PDF para mostrar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
