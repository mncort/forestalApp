'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Eye, Calendar } from 'lucide-react';
import { getPresupuestos, countPresupuestos, eliminarPresupuesto, getClientes } from '@/services/index';
import { usePagination } from '@/hooks/usePagination';
import { usePresupuestosFilters } from '@/hooks/usePresupuestosFilters';
import { DataTable, TablePagination } from '@/components/tables';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PresupuestoFilters from '@/components/filters/PresupuestoFilters';
import PresupuestoModal from '@/components/modals/presupuestos/PresupuestoModal';
import PresupuestoItemsModal from '@/components/modals/presupuestos/PresupuestoItemsModal';
import { buildPresupuestosWhereClause } from '@/lib/filters/presupuestosFilters';

export default function PresupuestosPage() {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [clientes, setClientes] = useState([]);

  // Hook de filtros
  const { filters, searchInput, updateFilter, clearFilters, hasActiveFilters } = usePresupuestosFilters();

  // Construir opciones de filtrado para la API (usar useMemo para evitar recreación)
  const filterOptions = React.useMemo(() => {
    const whereClause = buildPresupuestosWhereClause(filters, clientes);
    return whereClause ? { where: whereClause } : {};
  }, [filters, clientes]);

  // Usar hook de paginación con filtros
  const paginacion = usePagination(getPresupuestos, countPresupuestos, 10, [], filterOptions);
  const {
    datos: presupuestos,
    loading,
    error,
    recargar: reload
  } = paginacion;

  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (err) {
        console.error('Error cargando clientes:', err);
      }
    };
    cargarClientes();
  }, []);

  // Actualizar selectedPresupuesto cuando presupuestos cambie (después de reload)
  React.useEffect(() => {
    if (selectedPresupuesto && presupuestos) {
      const updated = presupuestos.find(p => p.id === selectedPresupuesto.id);
      if (updated) {
        setSelectedPresupuesto(updated);
      }
    }
  }, [presupuestos, selectedPresupuesto]);

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

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (presupuesto) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <span className="font-mono text-sm">
            #{String(presupuesto.id).substring(0, 8)}
          </span>
        </div>
      )
    },
    {
      key: 'Cliente',
      header: 'Cliente',
      render: (presupuesto) => (
        <div>
          <div className="font-medium">
            {presupuesto.fields.ClienteCompleto?.Nombre || 'Sin cliente'}
          </div>
          {presupuesto.fields.ClienteCompleto?.CUIT && (
            <div className="text-xs text-muted-foreground">
              CUIT: {presupuesto.fields.ClienteCompleto.CUIT}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'Descripcion',
      header: 'Descripción',
      render: (presupuesto) => (
        <div className="max-w-xs truncate">
          {presupuesto.fields.Descripcion || '-'}
        </div>
      )
    },
    {
      key: 'Estado',
      header: 'Estado',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (presupuesto) => (
        <Badge variant="outline">
          {presupuesto.fields.Estado || 'Borrador'}
        </Badge>
      )
    },
    {
      key: 'TipoPago',
      header: 'Tipo de Pago',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (presupuesto) =>
        presupuesto.fields.efectivo ? (
          <Badge className="bg-green-600 hover:bg-green-700 gap-1">
            Efectivo (10.5%)
          </Badge>
        ) : (
          <Badge className="bg-blue-600 hover:bg-blue-700 gap-1">
            Tarjeta (21%)
          </Badge>
        )
    },
    {
      key: 'Fecha',
      header: 'Fecha',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (presupuesto) => (
        <div className="flex items-center justify-center gap-1 text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          {formatearFecha(presupuesto.fields.CreatedAt)}
        </div>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      headerClassName: 'text-center',
      render: (presupuesto) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            onClick={() => {
              setSelectedPresupuesto(presupuesto);
              setShowItemsModal(true);
            }}
            title="Ver items"
          >
            <Eye size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedPresupuesto(presupuesto);
              setShowPresupuestoModal(true);
            }}
            title="Editar"
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90"
            onClick={() => handleEliminar(presupuesto)}
            title="Eliminar"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">Presupuestos</h2>
          <p className="text-sm text-muted-foreground">
            {presupuestos?.length || 0} presupuestos registrados
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPresupuesto(null);
            setShowPresupuestoModal(true);
          }}
          className="gap-2"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </Button>
      </div>

      <PresupuestoFilters
        filters={filters}
        searchInput={searchInput}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <Card>
        {error ? (
          <CardContent className="p-8">
            <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current text-destructive" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-destructive">{error}</p>
                <p className="mt-1 text-sm text-muted-foreground">Verifica que NocoDB esté corriendo</p>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={presupuestos || []}
              loading={loading}
              emptyMessage="No hay presupuestos registrados. Crea uno para comenzar."
            />

            <TablePagination {...paginacion} />
          </>
        )}
      </Card>

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
