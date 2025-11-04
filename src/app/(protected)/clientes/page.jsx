'use client'
import React, { useState } from 'react';
import { Plus, Edit2, User } from 'lucide-react';
import { getClientes, countClientes } from '@/lib/api/index';
import { usePagination } from '@/hooks/usePagination';
import { DataTable, TablePagination } from '@/components/tables';
import ClienteModal from '@/components/modals/clientes/ClienteModal';

export default function ClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showClienteModal, setShowClienteModal] = useState(false);

  // Usar hook de paginación
  const paginacion = usePagination(getClientes, countClientes, 10);
  const {
    datos: clientes,
    loading: loadingClientes,
    totalItems: totalClientes,
    recargar: reload
  } = paginacion;

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'Nombre',
      header: 'Nombre',
      render: (cliente) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-base-content/60" />
          <span className="font-medium">{cliente.fields?.Nombre || '-'}</span>
        </div>
      )
    },
    {
      key: 'CUIT',
      header: 'CUIT',
      render: (cliente) => (
        <span className="font-mono text-sm">{cliente.fields?.CUIT || '-'}</span>
      )
    },
    {
      key: 'CondicionIVA',
      header: 'Condición IVA',
      render: (cliente) =>
        cliente.fields?.CondicionIVA ? (
          <span className="badge badge-outline badge-sm">
            {cliente.fields.CondicionIVA}
          </span>
        ) : null
    },
    {
      key: 'Email',
      header: 'Email',
      className: 'text-sm text-base-content/70'
    },
    {
      key: 'Tel',
      header: 'Teléfono',
      className: 'text-sm text-base-content/70'
    },
    {
      key: 'Dirección',
      header: 'Dirección',
      className: 'text-sm text-base-content/70 max-w-xs truncate'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      headerClassName: 'text-center',
      render: (cliente) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setSelectedCliente(cliente);
              setShowClienteModal(true);
            }}
            className="btn btn-ghost btn-sm btn-square tooltip tooltip-top"
            data-tip="Editar"
          >
            <Edit2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Clientes</h2>
            <p className="text-base-content/70 text-sm mt-1">{totalClientes} clientes registrados</p>
          </div>
          <button
            onClick={() => {
              setSelectedCliente(null);
              setShowClienteModal(true);
            }}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <DataTable
            columns={columns}
            data={clientes}
            loading={loadingClientes}
            emptyMessage="No hay clientes registrados"
          />

          <TablePagination {...paginacion} />
        </div>
      </div>

      <ClienteModal
        show={showClienteModal}
        cliente={selectedCliente}
        onClose={() => setShowClienteModal(false)}
        onSaved={reload}
      />
    </div>
  );
}
