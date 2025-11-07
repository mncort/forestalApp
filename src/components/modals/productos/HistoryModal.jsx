'use client'
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { getCostoActual, getCostosArchivados } from '@/services/index';
import { formatDate } from '@/lib/utils/formatting';

export default function HistoryModal({ show, product, costos, onClose }) {
  const [costosHistoricos, setCostosHistoricos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar costos históricos cuando se abre el modal
  useEffect(() => {
    if (!show || !product) return;

    const cargarHistoricos = async () => {
      setLoading(true);
      try {
        const historicos = await getCostosArchivados(product.id);
        setCostosHistoricos(historicos);
      } catch (error) {
        console.error('Error cargando históricos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarHistoricos();
  }, [show, product]);

  if (!show || !product) return null;

  // Obtener todos los costos del producto (NO filtrar por valor)
  const costosProd = costos.filter(
    c => c.fields.Productos.id === product.id
  );

  // Combinar costos actuales con históricos archivados
  const todosLosCostos = [...costosProd, ...costosHistoricos];

  // Obtener fecha actual
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  // Obtener el costo actual
  const costoActual = getCostoActual(costos, product.id);

  // Separar en anteriores (ya pasaron) y próximos (empiezan en el futuro)
  const costosAnteriores = todosLosCostos.filter(c => {
    if (c.id === costoActual?.id) return false; // Excluir el actual

    const fechaDesde = c.fields.FechaDesde;
    const fechaHasta = c.fields.FechaHasta;

    // Es anterior si:
    // 1. Tiene fecha_hasta y ya pasó (fechaHasta < hoy), O
    // 2. No ha empezado aún pero tampoco es futuro (esto captura históricos)
    if (fechaHasta && fechaHasta < fechaHoy) {
      return true; // Ya terminó
    }

    // También es anterior si no es vigente ni próximo
    const esProximo = fechaDesde && fechaDesde > fechaHoy;
    const esVigente = fechaDesde && fechaDesde <= fechaHoy && (!fechaHasta || fechaHasta >= fechaHoy);

    return !esProximo && !esVigente;
  });

  const costosProximos = costosProd.filter(c => {
    if (c.id === costoActual?.id) return false; // Excluir el actual
    const fechaDesde = c.fields.FechaDesde;
    return fechaDesde && fechaDesde > fechaHoy; // Empiezan en el futuro
  });

  // Ordenar anteriores: más reciente primero
  costosAnteriores.sort((a, b) =>
    (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || '')
  );

  // Ordenar próximos: más cercano primero
  costosProximos.sort((a, b) =>
    (a.fields.FechaDesde || '').localeCompare(b.fields.FechaDesde || '')
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[80vh]">
        <h3 className="font-bold text-lg">Histórico de Costos</h3>
        <p className="text-sm text-base-content/70 mt-1">{product.fields.Nombre} (SKU: {product.fields.SKU})</p>

        <div className="py-4 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {/* Costos Próximos */}
            {costosProximos.length > 0 && (
              <>
                {costosProximos.map((item) => (
                  <div key={item.id} className="card bg-info/10 border border-info/30">
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-info">Próximo</span>
                          <p className="text-xl font-bold mt-1">
                            ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p>Desde: {formatDate(item.fields.FechaDesde)}</p>
                          <p>Hasta: {item.fields.FechaHasta ? formatDate(item.fields.FechaHasta) : '∞'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Costo Actual */}
            {costoActual && (
              <>
                <div className="card bg-success/10 border border-success/30">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-success">Costo Actual</span>
                        <p className="text-2xl font-bold mt-1">
                          ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.fields.Moneda}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Desde: {formatDate(costoActual.fields.FechaDesde)}</p>
                        <p>Hasta: {costoActual.fields.FechaHasta ? formatDate(costoActual.fields.FechaHasta) : '∞'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Costos Anteriores */}
            {costosAnteriores.length > 0 && (
              <>
                <div className="divider text-sm font-semibold text-base-content/70">Anteriores</div>
                {costosAnteriores.map((item) => (
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
                          <p>Desde: {formatDate(item.fields.FechaDesde)}</p>
                          <p>Hasta: {item.fields.FechaHasta ? formatDate(item.fields.FechaHasta) : '∞'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {costosProd.length === 0 && (
              <div className="text-center py-8 text-base-content/50">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay costos registrados</p>
              </div>
            )}

            {costosProd.length > 0 && !costoActual && costosAnteriores.length === 0 && costosProximos.length === 0 && (
              <div className="text-center py-8 text-base-content/50">
                <p>Solo hay costos vigentes</p>
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