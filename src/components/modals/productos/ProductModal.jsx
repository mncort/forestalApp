'use client'
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';

export default function ProductModal({ show, product, categorias, subcategorias, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    subcategoriaId: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState('');

  useEffect(() => {
    if (product) {
      const subcategoriaId = product.fields.Subcategoria?.id || '';
      const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
      const categoriaId = subcategoria?.fields.nc_1g29__Categorias_id || '';

      setFormData({
        nombre: product.fields.Nombre || '',
        sku: product.fields.SKU || '',
        subcategoriaId: subcategoriaId
      });
      setSelectedCategoria(categoriaId);
    } else {
      setFormData({
        nombre: '',
        sku: '',
        subcategoriaId: ''
      });
      setSelectedCategoria('');
    }
  }, [product, subcategorias]);

  const filteredSubcategorias = useMemo(() => {
    if (!selectedCategoria) return [];
    return subcategorias.filter(sub => sub.fields.nc_1g29__Categorias_id == selectedCategoria);
  }, [selectedCategoria, subcategorias]);

  const handleCategoriaChange = (newCategoriaId) => {
    setSelectedCategoria(newCategoriaId);
    setFormData(prev => ({ ...prev, subcategoriaId: '' }));
  };

  if (!show) return null;

  const isEditMode = !!product;

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error('Por favor ingresá el nombre del producto');
      return;
    }

    if (!formData.sku.trim()) {
      toast.error('Por favor ingresá el SKU');
      return;
    }

    if (!formData.subcategoriaId) {
      toast.error('Por favor seleccioná una subcategoría');
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        Nombre: formData.nombre.trim(),
        SKU: formData.sku.trim(),
        nc_1g29__Subcategorias_id: formData.subcategoriaId
      };

      if (isEditMode) {
        await updateRecord(TABLES.productos, product.id, recordData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await createRecord(TABLES.productos, recordData);
        toast.success('Producto creado exitosamente');
      }

      await onSaved();
      onClose();
      setFormData({ nombre: '', sku: '', subcategoriaId: '' });
      setSelectedCategoria('');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        <p className="py-2 text-sm text-base-content/70">
          {isEditMode ? 'Actualiza los datos del producto' : 'Completa los datos del nuevo producto'}
        </p>

        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre del Producto *</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input input-bordered w-full"
              placeholder="Ej: Tabla de Pino 2x4"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">SKU (Código) *</span>
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              className="input input-bordered w-full font-mono"
              placeholder="Ej: PINO-2X4"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Categoría *</span>
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => handleCategoriaChange(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.fields.Categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className={`label-text ${!selectedCategoria ? 'text-base-content/50' : ''}`}>
                Subcategoría *
              </span>
            </label>
            <select
              value={formData.subcategoriaId}
              onChange={(e) => setFormData({ ...formData, subcategoriaId: e.target.value })}
              className="select select-bordered w-full"
              disabled={!selectedCategoria}
            >
              <option value="">
                {selectedCategoria ? 'Seleccionar subcategoría...' : 'Primero selecciona una categoría'}
              </option>
              {filteredSubcategorias.map(subcat => (
                <option key={subcat.id} value={subcat.id}>
                  {subcat.fields.Subcategoria}
                </option>
              ))}
            </select>
            {selectedCategoria && filteredSubcategorias.length === 0 && (
              <label className="label">
                <span className="label-text-alt text-warning">Esta categoría no tiene subcategorías aún</span>
              </label>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving && <span className="loading loading-spinner loading-sm"></span>}
            {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}