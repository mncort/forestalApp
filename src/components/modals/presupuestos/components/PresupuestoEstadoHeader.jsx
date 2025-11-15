'use client'
import { FileText, Send, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Componente para mostrar el estado actual y los botones de acción
 */
export default function PresupuestoEstadoHeader({
  estadoActual,
  esEditable,
  cambiandoEstado,
  generandoPDF,
  onCambiarEstado,
  onVerPDF,
}) {
  // Configuración de badges según estado
  const estadoConfig = {
    Borrador: {
      label: 'BORRADOR',
      variant: 'secondary',
      className: 'bg-gray-200 text-gray-800',
    },
    Enviado: {
      label: 'ENVIADO',
      variant: 'default',
      className: 'bg-blue-500 text-white',
    },
    Aprobado: {
      label: 'APROBADO',
      variant: 'default',
      className: 'bg-green-500 text-white',
    },
    Rechazado: {
      label: 'RECHAZADO',
      variant: 'destructive',
      className: 'bg-red-500 text-white',
    },
  };

  const config = estadoConfig[estadoActual] || estadoConfig.Borrador;

  return (
    <div className="space-y-4">
      {/* Header con estado y botón PDF */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={config.className}>{config.label}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Ver PDF - siempre visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={onVerPDF}
            disabled={generandoPDF || cambiandoEstado}
          >
            {generandoPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Ver PDF {estadoActual === 'Borrador' && '(Preview)'}
          </Button>

          {/* Botones de cambio de estado según estado actual */}
          {estadoActual === 'Borrador' && (
            <Button
              size="sm"
              onClick={() => onCambiarEstado('Enviado')}
              disabled={cambiandoEstado || generandoPDF}
            >
              {cambiandoEstado ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Presupuesto
            </Button>
          )}

          {estadoActual === 'Enviado' && (
            <>
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onCambiarEstado('Aprobado')}
                disabled={cambiandoEstado || generandoPDF}
              >
                {cambiandoEstado ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCambiarEstado('Rechazado')}
                disabled={cambiandoEstado || generandoPDF}
              >
                {cambiandoEstado ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alerta si no es editable */}
      {!esEditable && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 font-medium">
            Este presupuesto ya fue enviado y no puede modificarse.
          </p>
        </div>
      )}
    </div>
  );
}
