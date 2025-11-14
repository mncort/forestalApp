'use client'
import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpDown, Package } from 'lucide-react';
import { getCategorias, getSubcategorias, getProductos, countProductos, getStockMovimientos } from '@/services/index';
import { useNocoDBMultiple } from '@/hooks/useNocoDB';
import { usePagination } from '@/hooks/usePagination';
import { DataTable, TablePagination } from '@/components/tables';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MovimientoModal from '@/components/modals/inventario/MovimientoModal';
import HistorialMovimientosModal from '@/components/modals/inventario/HistorialMovimientosModal';
import InventarioFilters from '@/components/filters/InventarioFilters';
import { buildInventarioWhereClause } from '@/lib/filters/inventarioFilters';

export default function InventarioPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);

  // Estados de filtros
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    categorias: [],
    subcategorias: []
  });

  // Cargar categorías y subcategorías (no cargamos movimientos aquí)
  const { data, loading: loadingMeta, error, reload: reloadOtros } = useNocoDBMultiple({
    categorias: getCategorias,
    subcategorias: getSubcategorias
  });

  const categorias = data.categorias || [];
  const subcategorias = data.subcategorias || [];

  // Construir opciones de filtrado para la API
  const filterOptions = useMemo(() => {
    const whereClause = buildInventarioWhereClause(filters, subcategorias);
    return whereClause ? { where: whereClause } : {};
  }, [filters, subcategorias]);

  // Usar hook de paginación para productos con filtros
  const paginacion = usePagination(getProductos, countProductos, 10, [], filterOptions);
  const {
    datos: productos,
    loading: loadingProductos,
    totalItems: totalProductos,
    recargar: recargarProductos
  } = paginacion;


  // Función reload completa
  const reload = () => {
    reloadOtros();
    recargarProductos();
  };

  // Manejar cambios en filtros
  const updateFilter = (key, value) => {
    if (key === 'search') {
      setSearchInput(value);
      // Aplicar búsqueda con debounce o al presionar Enter
      const timer = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: value }));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const toggleCategoria = (categoriaId) => {
    setFilters(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoriaId)
        ? prev.categorias.filter(id => id !== categoriaId)
        : [...prev.categorias, categoriaId]
    }));
  };

  const toggleSubcategoria = (subcategoriaId) => {
    setFilters(prev => ({
      ...prev,
      subcategorias: prev.subcategorias.includes(subcategoriaId)
        ? prev.subcategorias.filter(id => id !== subcategoriaId)
        : [...prev.subcategorias, subcategoriaId]
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      categorias: [],
      subcategorias: []
    });
  };

  const hasActiveFilters = filters.search || filters.categorias.length > 0 || filters.subcategorias.length > 0;

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'SKU',
      header: 'SKU',
      render: (prod) => (
        <Badge variant="outline" className="font-mono">{prod?.fields?.SKU || '-'}</Badge>
      )
    },
    {
      key: 'Nombre',
      header: 'Producto',
      render: (prod) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-muted-foreground" />
          <span className="font-medium">{prod?.fields?.Nombre || '-'}</span>
        </div>
      )
    },
    {
      key: 'Categoria',
      header: 'Categoría',
      className: 'text-sm text-muted-foreground',
      render: (prod) => {
        if (!prod?.fields?.Subcategoria?.id) return '-';
        const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
        if (!subcategoria?.fields?.nc_1g29__Categorias_id) return '-';
        const categoria = categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id);
        return categoria?.fields?.Categoria || '-';
      }
    },
    {
      key: 'Subcategoria',
      header: 'Subcategoría',
      className: 'text-sm text-muted-foreground',
      render: (prod) => {
        if (!prod?.fields?.Subcategoria?.id) return '-';
        const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
        return subcategoria?.fields?.Subcategoria || '-';
      }
    },
    {
      key: 'Stock',
      header: 'Stock Actual',
      className: 'text-right font-semibold',
      render: (prod) => {
        const stock = prod?.fields?.Stock || 0;
        const colorClass = stock > 0 ? 'text-green-600' : stock < 0 ? 'text-red-600' : 'text-muted-foreground';
        return <span className={colorClass}>{stock}</span>;
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      headerClassName: 'text-center',
      render: (prod) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedProduct(prod);
              setShowHistorialModal(true);
            }}
            title="Ver movimientos"
          >
            <ArrowUpDown size={18}/>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">Inventario</h2>
          <p className="text-sm text-muted-foreground">{totalProductos} productos registrados</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setShowMovimientoModal(true);
          }}
          className="gap-2"
        >
          <Plus size={20} />
          Nuevo Movimiento
        </Button>
      </div>

      <InventarioFilters
        filters={filters}
        searchInput={searchInput}
        onFilterChange={updateFilter}
        onToggleCategoria={toggleCategoria}
        onToggleSubcategoria={toggleSubcategoria}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        categorias={categorias}
        subcategorias={subcategorias}
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
              data={productos}
              loading={loadingProductos}
              emptyMessage="No hay productos registrados"
            />

            <TablePagination {...paginacion} />
          </>
        )}
      </Card>

      <MovimientoModal
        show={showMovimientoModal}
        producto={selectedProduct}
        onClose={() => {
          setShowMovimientoModal(false);
          setSelectedProduct(null);
        }}
        onSaved={reload}
      />

      <HistorialMovimientosModal
        show={showHistorialModal}
        producto={selectedProduct}
        onClose={() => {
          setShowHistorialModal(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
