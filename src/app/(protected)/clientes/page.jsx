'use client'
import React, { useState } from 'react';
import { Plus, Edit2, User } from 'lucide-react';
import { getClientes, countClientes } from '@/services/index';
import { usePagination } from '@/hooks/usePagination';
import { DataTable, TablePagination } from '@/components/tables';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
          <User size={16} className="text-muted-foreground" />
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
          <Badge variant="outline">
            {cliente.fields.CondicionIVA}
          </Badge>
        ) : null
    },
    {
      key: 'Email',
      header: 'Email',
      className: 'text-sm text-muted-foreground'
    },
    {
      key: 'Tel',
      header: 'Teléfono',
      className: 'text-sm text-muted-foreground'
    },
    {
      key: 'Dirección',
      header: 'Dirección',
      className: 'text-sm text-muted-foreground max-w-xs truncate'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      headerClassName: 'text-center',
      render: (cliente) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedCliente(cliente);
              setShowClienteModal(true);
            }}
            title="Editar"
          >
            <Edit2 size={18} />
          </Button>
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
            <p className="text-muted-foreground text-sm mt-1">{totalClientes} clientes registrados</p>
          </div>
          <Button
            onClick={() => {
              setSelectedCliente(null);
              setShowClienteModal(true);
            }}
            className="gap-2"
          >
            <Plus size={20} />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={clientes}
            loading={loadingClientes}
            emptyMessage="No hay clientes registrados"
          />

          <TablePagination {...paginacion} />
        </Card>
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
