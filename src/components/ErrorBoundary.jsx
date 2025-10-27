'use client'
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary genérico para capturar errores en componentes
 *
 * Uso:
 * <ErrorBoundary>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para que el siguiente render muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capturar detalles del error para logging
    console.error('Error Boundary capturó un error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Si hay una función de reset personalizada, ejecutarla
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI de error personalizada o la por defecto
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card max-w-2xl w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 text-error mb-4">
                <AlertTriangle size={32} />
                <h2 className="card-title text-2xl">Algo salió mal</h2>
              </div>

              <p className="text-base-content/70 mb-4">
                {this.props.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mockup-code text-xs mb-4 max-h-60 overflow-auto">
                  <pre data-prefix=">" className="text-error">
                    <code>{this.state.error.toString()}</code>
                  </pre>
                  {this.state.errorInfo && (
                    <pre data-prefix="" className="text-warning text-xs">
                      <code>{this.state.errorInfo.componentStack}</code>
                    </pre>
                  )}
                </div>
              )}

              <div className="card-actions justify-end gap-2">
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-outline gap-2"
                >
                  <Home size={18} />
                  Ir al inicio
                </button>
                <button
                  onClick={this.handleReset}
                  className="btn btn-primary gap-2"
                >
                  <RefreshCw size={18} />
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
