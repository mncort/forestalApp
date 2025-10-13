'use client'
import React, { useState } from 'react';
import { Plus, Edit2, History, DollarSign, Package } from 'lucide-react';
import { fetchCategorias, fetchSubcategorias, fetchProductos, fetchCostos, getCostoActual } from '@/lib/api/index';
import { useNocoDBMultiple } from '@/hooks/useNocoDB';
import CostModal from '@/components/CostModal';
import HistoryModal from '@/components/HistoryModal';
import ProductModal from '@/components/ProductModal';

export default function ProductosPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const { data, loading, error, reload } = useNocoDBMultiple({
    categorias: fetchCategorias,
    subcategorias: fetchSubcategorias,
    productos: fetchProductos,
    costos: fetchCostos
  });

  const categorias = data.categorias || [];
  const subcategorias = data.subcategorias || [];
  const productos = data.productos || [];
  const costos = data.costos || [];

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
              <p className="text-base-content/70 text-sm mt-1">{productos.length} productos registrados</p>
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
                  {productos.slice(0, 50).map(prod => {
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

            {productos.length > 50 && (
              <div className="p-4 bg-base-200 border-t border-base-300 text-center text-sm text-base-content/70">
                Mostrando 50 de {productos.length} productos
              </div>
            )}
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