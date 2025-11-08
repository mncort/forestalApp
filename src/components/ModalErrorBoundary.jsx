'use client'
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary específico para modales
 * Muestra una UI compacta adecuada para errores dentro de modales
 *
 * Uso:
 * <ModalErrorBoundary onClose={handleClose}>
 *   <MiModalContent />
 * </ModalErrorBoundary>
 */
export default function ModalErrorBoundary({ children, onClose, modalName }) {
  const fallback = (error, reset) => (
    <div className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={24} className="text-destructive flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            Error en {modalName || 'el formulario'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Ocurrió un problema al procesar la información. Por favor, intenta nuevamente.
          </p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="Cerrar"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-md p-3">
          <div className="text-xs space-y-1">
            <div className="font-bold text-destructive mb-1">Error de desarrollo:</div>
            <code className="text-xs text-muted-foreground break-all font-mono">
              {error.toString()}
            </code>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cerrar
          </Button>
        )}
        <Button
          onClick={reset}
        >
          Reintentar
        </Button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onReset={() => {
        // Resetear el estado del error boundary
        // El modal debería manejar su propio estado de reset si es necesario
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
