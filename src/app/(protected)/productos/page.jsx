'use client'
import React, { useState } from 'react';
import { Plus, Edit2, History, DollarSign, Package } from 'lucide-react';
import { getCategorias, getSubcategorias, getProductos, countProductos, getCostos, getCostoActual } from '@/lib/api/index';
import { useNocoDBMultiple } from '@/hooks/useNocoDB';
import { usePagination } from '@/hooks/usePagination';
import CostModal from '@/components/modals/productos/CostModal';
import HistoryModal from '@/components/modals/productos/HistoryModal';
import ProductModal from '@/components/modals/productos/ProductModal';

export default function ProductosPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Cargar categorías, subcategorías y costos (sin paginación)
  const { data, loading, error, reload: reloadOtros } = useNocoDBMultiple({
    categorias: getCategorias,
    subcategorias: getSubcategorias,
    costos: getCostos
  });

  const categorias = data.categorias || [];
  const subcategorias = data.subcategorias || [];
  const costos = data.costos || [];

  // Usar hook de paginación para productos
  const {
    datos: productos,
    loading: loadingProductos,
    paginaActual,
    itemsPorPagina: productosPorPagina,
    totalItems: totalProductos,
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
    recargar: recargarProductos
  } = usePagination(getProductos, countProductos, 10);

  // Función reload completa
  const reload = () => {
    reloadOtros();
    recargarProductos();
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
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
              <h2 className="text-3xl font-bold">Productos</h2>
              <p className="text-base-content/70 text-sm mt-1">{totalProductos} productos registrados</p>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setShowProductModal(true);
              }}
              className="btn btn-primary gap-2"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Subcategoría</th>
                    <th className="text-right">Costo Actual</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProductos ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                      </td>
                    </tr>
                  ) : productos.map(prod => {
                    const costoActual = getCostoActual(costos, prod.id);
                    const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
                    const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;

                    return (
                      <tr key={prod.id} className="hover">
                        <td>
                          <span className="font-mono text-sm font-medium badge badge-outline">{prod.fields.SKU}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-base-content/60" />
                            <span className="font-medium">{prod.fields.Nombre}</span>
                          </div>
                        </td>
                        <td className="text-sm text-base-content/70">
                          {categoria?.fields.Categoria || '-'}
                        </td>
                        <td className="text-sm text-base-content/70">
                          {subcategoria?.fields.Subcategoria || '-'}
                        </td>
                        <td className="text-right">
                          {costoActual ? (
                            <>
                              <span className="font-semibold">
                                ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-base-content/60 ml-1">{costoActual.fields.Moneda}</span>
                            </>
                          ) : (
                            <span className="text-sm text-base-content/50">Sin costo</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowCostModal(true);
                              }}
                              className="btn btn-ghost btn-sm btn-square tooltip tooltip-top text-success"
                              data-tip="Asignar costo"
                            >
                              <DollarSign size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowHistoryModal(true);
                              }}
                              className="btn btn-ghost btn-sm btn-square tooltip tooltip-top text-info"
                              data-tip="Ver histórico"
                            >
                              <History size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowProductModal(true);
                              }}
                              className="btn btn-ghost btn-sm btn-square tooltip tooltip-top"
                              data-tip="Editar producto"
                            >
                              <Edit2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Controles de paginación */}
            <div className="p-4 bg-base-200 border-t border-base-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Info y selector de cantidad */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-base-content/70">
                    Mostrando {inicio + 1} - {Math.min(fin, totalProductos)} de {totalProductos}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">Por página:</label>
                    <select
                      value={productosPorPagina}
                      onChange={(e) => cambiarItemsPorPagina(parseInt(e.target.value))}
                      className="select select-bordered select-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
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