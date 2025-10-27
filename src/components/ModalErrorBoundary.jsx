'use client'
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, X } from 'lucide-react';

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
    <div className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle size={24} className="text-error flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            Error en {modalName || 'el formulario'}
          </h3>
          <p className="text-sm text-base-content/70">
            Ocurrió un problema al procesar la información. Por favor, intenta nuevamente.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="alert alert-error mb-4">
          <div className="text-xs">
            <div className="font-bold mb-1">Error de desarrollo:</div>
            <code className="text-xs break-all">{error.toString()}</code>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cerrar
          </button>
        )}
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Reintentar
        </button>
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
