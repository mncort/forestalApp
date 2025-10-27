'use client'
import ErrorBoundary from './ErrorBoundary';
import { FileQuestion } from 'lucide-react';

/**
 * Error Boundary específico para páginas
 * Muestra una UI más adecuada para errores a nivel de página completa
 *
 * Uso:
 * <PageErrorBoundary>
 *   <MiPagina />
 * </PageErrorBoundary>
 */
export default function PageErrorBoundary({ children, pageName }) {
  const fallback = (error, reset) => (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card max-w-lg w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <FileQuestion size={64} className="text-error mb-4" />

          <h2 className="card-title text-2xl mb-2">
            Error al cargar {pageName || 'la página'}
          </h2>

          <p className="text-base-content/70 mb-6">
            No pudimos cargar el contenido. Esto puede deberse a un problema temporal.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="alert alert-error text-left w-full mb-4">
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold">Error:</span>
                <code className="whitespace-pre-wrap break-all">{error.toString()}</code>
              </div>
            </div>
          )}

          <div className="card-actions flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-outline flex-1"
            >
              Volver al inicio
            </button>
            <button
              onClick={reset}
              className="btn btn-primary flex-1"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      message={`Error al cargar ${pageName || 'la página'}`}
    >
      {children}
    </ErrorBoundary>
  );
}
