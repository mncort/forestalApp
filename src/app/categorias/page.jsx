'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Folder, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { fetchCategorias, fetchSubcategorias } from '@/lib/api';
import { NOCODB_URL } from '@/lib/nocodb-config';

export default function CategoriasPage() {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catData, subcatData] = await Promise.all([
        fetchCategorias(),
        fetchSubcategorias()
      ]);

      setCategorias(catData);
      setSubcategorias(subcatData);

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
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo en {NOCODB_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-6 py-8">
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
    </div>
  );
}
