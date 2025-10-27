'use client'
import React, { useState } from 'react';
import { Plus, Edit2, Folder, ChevronRight } from 'lucide-react';
import { getCategorias, getSubcategorias } from '@/lib/api/index';
import { useNocoDBMultiple } from '@/hooks/useNocoDB';
import { NOCODB_URL } from '@/lib/nocodb-config';
import CategoryModal from '@/components/modals/categorias/CategoryModal';
import SubcategoryModal from '@/components/modals/categorias/SubcategoryModal';

export default function CategoriasPage() {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);
  const [currentCategoriaId, setCurrentCategoriaId] = useState(null);

  const { data, loading, error, reload } = useNocoDBMultiple({
    categorias: getCategorias,
    subcategorias: getSubcategorias
  });

  const categorias = data.categorias || [];
  const subcategorias = data.subcategorias || [];

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
            <p className="text-sm mt-1">Verifica que NocoDB esté corriendo en {NOCODB_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Categorías y Subcategorías</h2>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowCategoryModal(true);
            }}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>

        <div className="grid gap-4">
          {categorias.map(cat => {
            const isExpanded = expandedCategories.has(cat.id);
            const subcats = getSubcategoriasByCategoria(cat.id);

            return (
              <div key={cat.id} className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition">
                <div
                  className="card-body cursor-pointer hover:bg-base-200 transition p-6"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="text-base-content/60" size={20} />
                      </button>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Folder className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="card-title text-lg">{cat.fields.Categoria}</h3>
                        <p className="text-sm text-base-content/70">
                          {subcats.length} subcategorías • Ganancia {cat.fields.Markup}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryModal(true);
                        }}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Editar categoría"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-base-200 border-t border-base-300">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold">Subcategorías</h4>
                        <button
                          onClick={() => {
                            setSelectedSubcategoria(null);
                            setCurrentCategoriaId(cat.id);
                            setShowSubcategoryModal(true);
                          }}
                          className="btn btn-sm btn-primary gap-1"
                        >
                          <Plus size={16} />
                          Agregar
                        </button>
                      </div>

                      {subcats.length === 0 ? (
                        <div className="text-center py-8 text-base-content/50">
                          <p>No hay subcategorías</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {subcats.map(subcat => (
                            <div key={subcat.id} className="card bg-base-100 border border-base-300 hover:border-primary transition group">
                              <div className="card-body p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium">{subcat.fields.Subcategoria}</h5>
                                      <span className="badge badge-ghost badge-sm">
                                        {subcat.fields.Productos || 0} productos
                                      </span>
                                    </div>
                                    <p className="text-sm text-base-content/70 mt-1">{subcat.fields.Descripcion}</p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      onClick={() => {
                                        setSelectedSubcategoria(subcat);
                                        setCurrentCategoriaId(cat.id);
                                        setShowSubcategoryModal(true);
                                      }}
                                      className="btn btn-ghost btn-sm btn-square"
                                      title="Editar subcategoría"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                  </div>
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

      <CategoryModal
        show={showCategoryModal}
        category={selectedCategory}
        onClose={() => setShowCategoryModal(false)}
        onSaved={reload}
      />

      <SubcategoryModal
        show={showSubcategoryModal}
        subcategoria={selectedSubcategoria}
        categoriaId={currentCategoriaId}
        onClose={() => setShowSubcategoryModal(false)}
        onSaved={reload}
      />
    </div>
  );
}