'use client'
import React, { useState } from 'react';
import { Plus, Edit2, History, DollarSign, Package } from 'lucide-react';
import { getCategorias, getSubcategorias, getProductos, countProductos, getCostos, getCostoActual } from '@/services/index';
import { useNocoDBMultiple } from '@/hooks/useNocoDB';
import { usePagination } from '@/hooks/usePagination';
import { useProductosFilters } from '@/hooks/useProductosFilters';
import { DataTable, TablePagination } from '@/components/tables';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductoFilters from '@/components/filters/ProductoFilters';
import CostModal from '@/components/modals/productos/CostModal';
import HistoryModal from '@/components/modals/productos/HistoryModal';
import ProductModal from '@/components/modals/productos/ProductModal';
import { buildProductosWhereClause } from '@/lib/filters/productosFilters';

export default function ProductosPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Hook de filtros
  const { filters, searchInput, updateFilter, toggleCategoria, toggleSubcategoria, clearFilters, hasActiveFilters } = useProductosFilters();

  // Cargar categorías, subcategorías y costos (sin paginación)
  const { data, loading, error, reload: reloadOtros } = useNocoDBMultiple({
    categorias: getCategorias,
    subcategorias: getSubcategorias,
    costos: getCostos
  });

  const categorias = data.categorias || [];
  const subcategorias = data.subcategorias || [];
  const costos = data.costos || [];

  // Construir opciones de filtrado para la API (usar useMemo para evitar recreación)
  const filterOptions = React.useMemo(() => {
    const whereClause = buildProductosWhereClause(filters, subcategorias);
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

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'SKU',
      header: 'SKU',
      render: (prod) => (
        <Badge variant="outline" className="font-mono">{prod.fields.SKU}</Badge>
      )
    },
    {
      key: 'Nombre',
      header: 'Producto',
      render: (prod) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-muted-foreground" />
          <span className="font-medium">{prod.fields.Nombre}</span>
        </div>
      )
    },
    {
      key: 'Categoria',
      header: 'Categoría',
      className: 'text-sm text-muted-foreground',
      render: (prod) => {
        const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
        const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;
        return categoria?.fields.Categoria || '-';
      }
    },
    {
      key: 'Subcategoria',
      header: 'Subcategoría',
      className: 'text-sm text-muted-foreground',
      render: (prod) => {
        const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
        return subcategoria?.fields.Subcategoria || '-';
      }
    },
    {
      key: 'Costo',
      header: 'Costo Actual',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (prod) => {
        const costoActual = getCostoActual(costos, prod.id);
        return costoActual ? (
          <>
            <span className="font-semibold">
              ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-muted-foreground ml-1">{costoActual.fields.Moneda}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Sin costo</span>
        );
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      headerClassName: 'text-center',
      render: (prod) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600 hover:text-green-700"
            onClick={() => {
              setSelectedProduct(prod);
              setShowCostModal(true);
            }}
            title="Asignar costo"
          >
            <DollarSign size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            onClick={() => {
              setSelectedProduct(prod);
              setShowHistoryModal(true);
            }}
            title="Ver histórico"
          >
            <History size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedProduct(prod);
              setShowProductModal(true);
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
              <h2 className="text-3xl font-bold">Productos</h2>
              <p className="text-muted-foreground text-sm mt-1">{totalProductos} productos registrados</p>
            </div>
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setShowProductModal(true);
              }}
              className="gap-2"
            >
              <Plus size={20} />
              Nuevo Producto
            </Button>
          </div>

          {/* Filtros */}
          <ProductoFilters
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
                <div className="flex items-center gap-3 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-destructive">{error}</p>
                    <p className="text-sm mt-1 text-muted-foreground">Verifica que NocoDB esté corriendo</p>
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
        </div>

        <CostModal
          show={showCostModal}
          product={selectedProduct}
          onClose={() => setShowCostModal(false)}
          onSaved={reload}
        />
        <HistoryModal
          show={showHistoryModal}
          product={selectedProduct}
          costos={costos}
          onClose={() => setShowHistoryModal(false)}
        />
        <ProductModal
          show={showProductModal}
          product={selectedProduct}
          categorias={categorias}
          subcategorias={subcategorias}
          onClose={() => setShowProductModal(false)}
          onSaved={reload}
        />
      </div>
  );
}