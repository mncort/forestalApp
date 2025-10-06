'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, History, DollarSign, Package, Folder, ChevronRight, Loader, AlertCircle } from 'lucide-react';

const ForestApp = () => {
  const [activeTab, setActiveTab] = useState('categorias');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [costos, setCostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const NOCODB_URL = 'http://192.168.0.102:7200';
  const API_TOKEN = 'WID_c3jzbtRRmmojeJ1kpSKUqXuPQ3zoq8r3B0yr';
  const HEADERS = {
    'xc-token': API_TOKEN,
    'Content-Type': 'application/json'
  };

  const TABLES = {
    categorias: 'mki28en6bedf5cu',
    subcategorias: 'mmlg9mykn3x2wba',
    productos: 'mqs4c3qv5r4qkeu',
    costos: 'mx17jsmdlsczskq'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const BASE_ID = 'pkd32qoz1fc1g4k';
      
      const [catRes, subcatRes, prodRes, costRes] = await Promise.all([
        fetch(`${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.categorias}/records?limit=100`, { headers: HEADERS }),
        fetch(`${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.subcategorias}/records?limit=100`, { headers: HEADERS }),
        fetch(`${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.productos}/records?limit=100`, { headers: HEADERS }),
        fetch(`${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.costos}/records?limit=100`, { headers: HEADERS })
      ]);

      const [catData, subcatData, prodData, costData] = await Promise.all([
        catRes.json(),
        subcatRes.json(),
        prodRes.json(),
        costRes.json()
      ]);

      setCategorias(catData.records || catData.list || []);
      setSubcategorias(subcatData.records || subcatData.list || []);
      setProductos(prodData.records || prodData.list || []);
      setCostos(costData.records || costData.list || []);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con NocoDB: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategoriasByCategoria = (catId) => {
    return subcategorias.filter(sub => sub.fields.nc_1g29__Categorias_id === catId);
  };

  const getCostoActual = (productoId) => {
    const costosProd = costos.filter(c => c.fields.Productos.id === productoId);
    const hoy = new Date().toISOString().split('T')[0];
    const vigentes = costosProd.filter(c => !c.fields.FechaHasta || c.fields.FechaHasta >= hoy);
    vigentes.sort((a, b) => (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || ''));
    return vigentes[0];
  };

  const CategoriasTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3 text-red-800">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo en {NOCODB_URL}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Categorías y Subcategorías</h2>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>

        <div className="grid gap-4">
          {categorias.map(cat => {
            const isExpanded = expandedCategories.has(cat.id);
            const subcats = getSubcategoriasByCategoria(cat.id);
            console.log(cat)
            
            return (
              <div key={cat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="text-gray-400" size={20} />
                      </button>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Folder className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{cat.fields.Categoria}</h3>
                        <p className="text-sm text-gray-500">
                          {subcats.length} subcategorías • Ganancia {cat.fields.Markup}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-gray-700">Subcategorías</h4>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Plus size={16} />
                          Agregar
                        </button>
                      </div>
                      
                      {subcats.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No hay subcategorías</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {subcats.map(subcat => (
                            <div key={subcat.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition group">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium text-gray-800">{subcat.fields.Subcategoria}</h5>
                                    <span className="text-xs text-gray-500">
                                      {subcat.fields.Productos || 0} productos
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{subcat.fields.Descripcion}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                    <Edit2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ProductosTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3 text-red-800">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo</p>
          </div>
        </div>
      );
    }

    return (
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
                  const costoActual = getCostoActual(prod.id);
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
    );
  };

  const CostModal = () => {
    const [formData, setFormData] = useState({
      costo: '',
      moneda: 'ARS',
      fechaDesde: new Date().toISOString().split('T')[0],
      fechaHasta: ''
    });
    const [saving, setSaving] = useState(false);

    if (!showCostModal || !selectedProduct) return null;

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
            nc_1g29__Productos_id: selectedProduct.id
          })
        });

        if (response.ok) {
          await loadData();
          setShowCostModal(false);
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
            <p className="text-sm text-gray-500 mt-1">{selectedProduct.Nombre}</p>
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
                  onChange={(e) => setFormData({...formData, costo: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select 
                value={formData.moneda}
                onChange={(e) => setFormData({...formData, moneda: e.target.value})}
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
                onChange={(e) => setFormData({...formData, fechaDesde: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta (opcional)</label>
              <input 
                type="date" 
                value={formData.fechaHasta}
                onChange={(e) => setFormData({...formData, fechaHasta: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <button 
              onClick={() => setShowCostModal(false)}
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
  };

  const HistoryModal = () => {
    if (!showHistoryModal || !selectedProduct) return null;
    
    const costosProd = costos.filter(c => c.nc_1g29__Productos_id === selectedProduct.id);
    costosProd.sort((a, b) => (b.FechaDesde || '').localeCompare(a.FechaDesde || ''));
    
    const costoActual = getCostoActual(selectedProduct.id);
    const historicos = costosProd.filter(c => c.id !== costoActual?.id);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Histórico de Costos</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedProduct.Nombre} (SKU: {selectedProduct.SKU})</p>
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
                        ${parseFloat(costoActual.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.Moneda}
                      </p>
                    </div>
                    <div className="text-right text-sm text-green-700">
                      <p>Desde: {new Date(costoActual.FechaDesde).toLocaleDateString('es-AR')}</p>
                      <p className="text-green-600">Hasta: {costoActual.FechaHasta ? new Date(costoActual.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
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
                        ${parseFloat(item.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.Moneda}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Desde: {new Date(item.FechaDesde).toLocaleDateString('es-AR')}</p>
                      <p>Hasta: {item.FechaHasta ? new Date(item.FechaHasta).toLocaleDateString('es-AR') : '∞'}</p>
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
              onClick={() => setShowHistoryModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">🌲 Gestión Forestal</h1>
            <button 
              onClick={loadData}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : '🔄'}
              Recargar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('categorias')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'categorias'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Categorías & Subcategorías
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'productos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Productos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'categorias' && <CategoriasTab />}
        {activeTab === 'productos' && <ProductosTab />}
      </div>

      <CostModal />
      <HistoryModal />
    </div>
  );
};

export default ForestApp;