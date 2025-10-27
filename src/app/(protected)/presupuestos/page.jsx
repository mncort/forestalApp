'use client'
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Eye, Calendar } from 'lucide-react';
import { getPresupuestos, eliminarPresupuesto } from '@/lib/api/index';
import { useNocoDB } from '@/hooks/useNocoDB';
import PresupuestoModal from '@/components/modals/presupuestos/PresupuestoModal';
import PresupuestoItemsModal from '@/components/modals/presupuestos/PresupuestoItemsModal';

export default function PresupuestosPage() {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const { data: presupuestos, loading, error, reload } = useNocoDB(getPresupuestos);

  const handleEliminar = async (presupuesto) => {
    const presupuestoId = String(presupuesto.id).substring(0, 8);
    if (!confirm(`¿Estás seguro de eliminar el presupuesto #${presupuestoId} de "${presupuesto.fields.Cliente}"?`)) {
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

        <div className="grid gap-4">
          {!presupuestos || presupuestos.length === 0 ? (
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body items-center text-center py-12">
                <FileText size={48} className="text-base-content/30 mb-4" />
                <p className="text-base-content/70">
                  No hay presupuestos registrados. Crea uno para comenzar.
                </p>
              </div>
            </div>
          ) : (
            presupuestos.map((presupuesto) => (
              <div
                key={presupuesto.id}
                className="card bg-base-100 shadow-xl border border-base-300 hover:border-primary transition-all"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-primary" />
                        <h3 className="card-title text-xl">Presupuesto #{String(presupuesto.id).substring(0, 8)}</h3>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {presupuesto.fields.Cliente && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Cliente:</span>
                            <span className="text-base-content/70">{presupuesto.fields.Cliente}</span>
                          </div>
                        )}

                        {presupuesto.fields.CreatedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar size={16} className="text-base-content/60" />
                            <span className="text-base-content/70">{formatearFecha(presupuesto.fields.CreatedAt)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <span className="badge badge-outline badge-sm">
                            {presupuesto.fields.Estado || 'Borrador'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center h-full gap-1">
                      <button
                        onClick={() => {
                          setSelectedPresupuesto(presupuesto);
                          setShowItemsModal(true);
                        }}
                        className="btn btn-ghost btn-sm btn-square tooltip tooltip-left"
                        data-tip="Ver items"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPresupuesto(presupuesto);
                          setShowPresupuestoModal(true);
                        }}
                        className="btn btn-ghost btn-sm btn-square tooltip tooltip-left"
                        data-tip="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleEliminar(presupuesto)}
                        className="btn btn-ghost btn-sm btn-square tooltip tooltip-left text-error"
                        data-tip="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
