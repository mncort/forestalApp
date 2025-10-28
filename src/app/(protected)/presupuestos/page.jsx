'use client'
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Eye, Calendar } from 'lucide-react';
import { getPresupuestos, countPresupuestos, eliminarPresupuesto } from '@/lib/api/index';
import { usePagination } from '@/hooks/usePagination';
import PresupuestoModal from '@/components/modals/presupuestos/PresupuestoModal';
import PresupuestoItemsModal from '@/components/modals/presupuestos/PresupuestoItemsModal';

export default function PresupuestosPage() {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  // Usar hook de paginación
  const {
    datos: presupuestos,
    loading,
    error,
    paginaActual,
    itemsPorPagina,
    totalItems: totalPresupuestos,
    totalPaginas,
    inicio,
    fin,
    hayPaginaAnterior,
    hayPaginaSiguiente,
    irAPrimeraPagina,
    irAUltimaPagina,
    irAPaginaAnterior,
    irAPaginaSiguiente,
    cambiarItemsPorPagina,
    recargar: reload
  } = usePagination(getPresupuestos, countPresupuestos, 10);

  // Actualizar selectedPresupuesto cuando presupuestos cambie (después de reload)
  React.useEffect(() => {
    if (selectedPresupuesto && presupuestos) {
      const updated = presupuestos.find(p => p.id === selectedPresupuesto.id);
      if (updated) {
        setSelectedPresupuesto(updated);
      }
    }
  }, [presupuestos]);

  const handleEliminar = async (presupuesto) => {
    const presupuestoId = String(presupuesto.id).substring(0, 8);
    const clienteNombre = presupuesto.fields.ClienteCompleto?.Nombre || 'Sin cliente';
    if (!confirm(`¿Estás seguro de eliminar el presupuesto #${presupuestoId} de "${clienteNombre}"?`)) {
      return;
    }

    try {
      await eliminarPresupuesto(presupuesto.id);
      reload();
    } catch (err) {
      console.error('Error al eliminar presupuesto:', err);
      alert('Error al eliminar el presupuesto');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Presupuestos</h2>
            <p className="text-base-content/70 text-sm mt-1">
              {presupuestos?.length || 0} presupuestos registrados
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPresupuesto(null);
              setShowPresupuestoModal(true);
            }}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Nuevo Presupuesto
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-0">
            {!presupuestos || presupuestos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText size={48} className="text-base-content/30 mb-4" />
                <p className="text-base-content/70">
                  No hay presupuestos registrados. Crea uno para comenzar.
                </p>
              </div>
            ) : (
              <div>
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Descripción</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">Tipo de Pago</th>
                      <th className="text-center">Fecha</th>
                      <th className="text-center w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presupuestos?.map((presupuesto) => (
                      <tr key={presupuesto.id} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            <span className="font-mono text-sm">
                              #{String(presupuesto.id).substring(0, 8)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="font-medium">
                            {presupuesto.fields.ClienteCompleto?.Nombre || 'Sin cliente'}
                          </div>
                          {presupuesto.fields.ClienteCompleto?.CUIT && (
                            <div className="text-xs text-base-content/60">
                              CUIT: {presupuesto.fields.ClienteCompleto.CUIT}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="max-w-xs truncate">
                            {presupuesto.fields.Descripcion || '-'}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-outline badge-sm">
                            {presupuesto.fields.Estado || 'Borrador'}
                          </span>
                        </td>
                        <td className="text-center">
                          {presupuesto.fields.efectivo ? (
                            <span className="badge badge-success badge-sm gap-1">
                              Efectivo (10.5%)
                            </span>
                          ) : (
                            <span className="badge badge-info badge-sm gap-1">
                              Tarjeta (21%)
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Calendar size={14} className="text-base-content/60" />
                            {formatearFecha(presupuesto.fields.CreatedAt)}
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPresupuesto(presupuesto);
                                setShowItemsModal(true);
                              }}
                              className="btn btn-ghost btn-sm btn-square tooltip"
                              data-tip="Ver items"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPresupuesto(presupuesto);
                                setShowPresupuestoModal(true);
                              }}
                              className="btn btn-ghost btn-sm btn-square tooltip"
                              data-tip="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleEliminar(presupuesto)}
                              className="btn btn-ghost btn-sm btn-square tooltip text-error"
                              data-tip="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Controles de paginación */}
            <div className="p-4 bg-base-200 border-t border-base-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Info y selector de cantidad */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-base-content/70">
                    Mostrando {inicio} - {fin} de {totalPresupuestos} presupuestos
                  </span>
                  <select
                    value={itemsPorPagina}
                    onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
                    className="select select-bordered select-sm"
                  >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </select>
                </div>

                {/* Botones de navegación */}
                <div className="join">
                  <button
                    onClick={irAPrimeraPagina}
                    disabled={!hayPaginaAnterior}
                    className="join-item btn btn-sm"
                  >
                    ««
                  </button>
                  <button
                    onClick={irAPaginaAnterior}
                    disabled={!hayPaginaAnterior}
                    className="join-item btn btn-sm"
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm no-animation">
                    Página {paginaActual} de {totalPaginas}
                  </button>
                  <button
                    onClick={irAPaginaSiguiente}
                    disabled={!hayPaginaSiguiente}
                    className="join-item btn btn-sm"
                  >
                    »
                  </button>
                  <button
                    onClick={irAUltimaPagina}
                    disabled={!hayPaginaSiguiente}
                    className="join-item btn btn-sm"
                  >
                    »»
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PresupuestoModal
        show={showPresupuestoModal}
        presupuesto={selectedPresupuesto}
        onClose={() => setShowPresupuestoModal(false)}
        onSaved={reload}
      />

      <PresupuestoItemsModal
        show={showItemsModal}
        presupuesto={selectedPresupuesto}
        onClose={() => setShowItemsModal(false)}
        onSaved={reload}
      />
    </div>
  );
}
