'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, History, DollarSign, Package, Loader, AlertCircle } from 'lucide-react';
import { fetchCategorias, fetchSubcategorias, fetchProductos, fetchCostos, getCostoActual } from '@/lib/api/index';
import CostModal from '@/components/CostModal';
import HistoryModal from '@/components/HistoryModal';

export default function ProductosPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [costos, setCostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catData, subcatData, prodData, costData] = await Promise.all([
        fetchCategorias(),
        fetchSubcategorias(),
        fetchProductos(),
        fetchCostos()
      ]);

      setCategorias(catData);
      setSubcategorias(subcatData);
      setProductos(prodData);
      setCostos(costData);

    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con NocoDB: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3 text-red-800">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
              <p className="text-gray-500 text-sm mt-1">{productos.length} productos registrados</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">SKU</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Producto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Subcategoría</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Costo Actual</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productos.slice(0, 50).map(prod => {
                    const costoActual = getCostoActual(costos, prod.id);
                    const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria.id);
                    const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium text-gray-700">{prod.fields.SKU}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-800">{prod.fields.Nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {categoria?.fields.Categoria || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {subcategoria?.fields.Subcategoria || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {costoActual ? (
                            <>
                              <span className="font-semibold text-gray-800">
                                ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">{costoActual.fields.Moneda}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Sin costo</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowCostModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Asignar costo"
                            >
                              <DollarSign size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowHistoryModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Ver histórico"
                            >
                              <History size={18} />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
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
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
                Mostrando 50 de {productos.length} productos
              </div>
            )}
          </div>
        </div>

        <CostModal
          show={showCostModal}
          product={selectedProduct}
          onClose={() => setShowCostModal(false)}
          onSaved={loadData}
        />
        <HistoryModal
          show={showHistoryModal}
          product={selectedProduct}
          costos={costos}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
  );
}
