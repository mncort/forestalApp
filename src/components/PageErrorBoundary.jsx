'use client'
import ErrorBoundary from './ErrorBoundary';
import { FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full border-destructive/50 bg-destructive/10">
        <CardHeader className="text-center">
          <FileQuestion size={64} className="text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl">
            Error al cargar {pageName || 'la página'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            No pudimos cargar el contenido. Esto puede deberse a un problema temporal.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-md p-4 text-left">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-destructive">Error:</span>
                <code className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">
                  {error.toString()}
                </code>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              Volver al inicio
            </Button>
            <Button
              onClick={reset}
              className="flex-1"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
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
