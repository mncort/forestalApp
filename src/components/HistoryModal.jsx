'use client'
import React from 'react';
import { History } from 'lucide-react';
import { getCostoActual } from '@/lib/api/index';

export default function HistoryModal({ show, product, costos, onClose }) {
  if (!show || !product) return null;

  const costosProd = costos.filter(c => c.fields.Productos.id === product.id);
  costosProd.sort((a, b) => (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || ''));

  const costoActual = getCostoActual(costos, product.id);
  const historicos = costosProd.filter(c => c.id !== costoActual?.id);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Histórico de Costos</h3>
          <p className="text-sm text-gray-500 mt-1">{product.fields.Nombre} (SKU: {product.fields.SKU})</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {costoActual && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700">Costo Actual</span>
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-medium rounded">VIGENTE</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.fields.Moneda}
                    </p>
                  </div>
                  <div className="text-right text-sm text-green-700">
                    <p>Desde: {new Date(costoActual.fields.FechaDesde).toLocaleDateString('es-AR')}</p>
                    <p className="text-green-600">Hasta: {costoActual.fields.FechaHasta ? new Date(costoActual.fields.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
                  </div>
                </div>
              </div>
            )}

            {historicos.map((item) => (
              <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Anterior</span>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Desde: {new Date(item.fields.FechaDesde).toLocaleDateString('es-AR')}</p>
                    <p>Hasta: {item.fields.FechaHasta ? new Date(item.fields.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
                  </div>
                </div>
              </div>
            ))}

            {costosProd.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay costos registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
