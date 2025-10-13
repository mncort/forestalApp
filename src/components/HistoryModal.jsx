'use client'
import React from 'react';
import { History } from 'lucide-react';
import { getCostoActual } from '@/lib/api/index';

export default function HistoryModal({ show, product, costos, onClose }) {
  if (!show || !product) return null;

  // Función helper para formatear fecha sin conversión de zona horaria
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    // Si la fecha viene como YYYY-MM-DD, parsearla manualmente
    const partes = fechaStr.split('T')[0].split('-');
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    return fecha.toLocaleDateString('es-AR');
  };

  const costosProd = costos.filter(c => c.fields.Productos.id === product.id);
  costosProd.sort((a, b) => (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || ''));

  const costoActual = getCostoActual(costos, product.id);
  const historicos = costosProd.filter(c => c.id !== costoActual?.id);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[80vh]">
        <h3 className="font-bold text-lg">Histórico de Costos</h3>
        <p className="text-sm text-base-content/70 mt-1">{product.fields.Nombre} (SKU: {product.fields.SKU})</p>

        <div className="py-4 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {costoActual && (
              <div className="alert alert-success">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Costo Actual</span>
                        <span className="badge badge-success badge-sm">VIGENTE</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.fields.Moneda}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Desde: {formatearFecha(costoActual.fields.FechaDesde)}</p>
                      <p>Hasta: {costoActual.fields.FechaHasta ? formatearFecha(costoActual.fields.FechaHasta) : '∞'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {historicos.map((item) => (
              <div key={item.id} className="card bg-base-200 border border-base-300">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-base-content/70">Anterior</span>
                      <p className="text-xl font-bold mt-1">
                        ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                      </p>
                    </div>
                    <div className="text-right text-sm text-base-content/70">
                      <p>Desde: {formatearFecha(item.fields.FechaDesde)}</p>
                      <p>Hasta: {item.fields.FechaHasta ? formatearFecha(item.fields.FechaHasta) : '∞'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {costosProd.length === 0 && (
              <div className="text-center py-8 text-base-content/50">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay costos registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}