'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, History, DollarSign, Package, Loader, AlertCircle } from 'lucide-react';
import { fetchCategorias, fetchSubcategorias, fetchProductos, fetchCostos, getCostoActual } from '@/lib/api';
import { NOCODB_URL, HEADERS, TABLES } from '@/lib/nocodb-config';
import Link from 'next/link';

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
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3 text-red-800">
            <AlertCircle size={24} />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">Verifica que NocoDB esté corriendo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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

function CostModal({ show, product, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    costo: '',
    moneda: 'ARS',
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: ''
  });
  const [saving, setSaving] = useState(false);

  if (!show || !product) return null;

  const handleSave = async () => {
    if (!formData.costo) {
      alert('Ingresá un costo');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${NOCODB_URL}/api/v2/tables/${TABLES.costos}/records`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          Costo: parseFloat(formData.costo),
          Moneda: formData.moneda,
          FechaDesde: formData.fechaDesde,
          FechaHasta: formData.fechaHasta || null,
          nc_1g29__Productos_id: product.id
        })
      });

      if (response.ok) {
        await onSaved();
        onClose();
        setFormData({ costo: '', moneda: 'ARS', fechaDesde: new Date().toISOString().split('T')[0], fechaHasta: '' });
        alert('✅ Costo guardado');
      } else {
        alert('❌ Error al guardar');
      }
    } catch (err) {
      alert('❌ Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Asignar Costo</h3>
          <p className="text-sm text-gray-500 mt-1">{product.fields.Nombre}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Costo *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              value={formData.moneda}
              onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dólar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde *</label>
            <input
              type="date"
              value={formData.fechaDesde}
              onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta (opcional)</label>
            <input
              type="date"
              value={formData.fechaHasta}
              onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            disabled={saving}
          >
            {saving && <Loader size={16} className="animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ show, product, costos, onClose }) {
  if (!show || !product) return null;

  const costosProd = costos.filter(c => c.fields.Productos.id === product.id);
  costosProd.sort((a, b) => (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || ''));

  const costoActual = getCostoActual(costos, product.id);
  const historicos = costosProd.filter(c => c.id !== costoActual?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Histórico de Costos</h3>
          <p className="text-sm text-gray-500 mt-1">{product.fields.Nombre} (SKU: {product.fields.SKU})</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {costoActual && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700">Costo Actual</span>
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-medium rounded">VIGENTE</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.fields.Moneda}
                    </p>
                  </div>
                  <div className="text-right text-sm text-green-700">
                    <p>Desde: {new Date(costoActual.fields.FechaDesde).toLocaleDateString('es-AR')}</p>
                    <p className="text-green-600">Hasta: {costoActual.fields.FechaHasta ? new Date(costoActual.fields.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
                  </div>
                </div>
              </div>
            )}

            {historicos.map((item) => (
              <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Anterior</span>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                      ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Desde: {new Date(item.fields.FechaDesde).toLocaleDateString('es-AR')}</p>
                    <p>Hasta: {item.fields.FechaHasta ? new Date(item.fields.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
                  </div>
                </div>
              </div>
            ))}

            {costosProd.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay costos registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
