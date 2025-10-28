'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';
import { validarTextoRequerido, validarSKU, mensajesError } from '@/lib/utils/validation';

export default function ProductModal({ show, product, categorias, subcategorias, onClose, onSaved }) {
  const [selectedCategoria, setSelectedCategoria] = useState('');

  // Transformar datos de la entidad para el hook
  const transformedEntity = product ? {
    fields: {
      nombre: product.fields?.Nombre || '',
      sku: product.fields?.SKU || '',
      subcategoriaId: product.fields?.Subcategoria?.id || ''
    }
  } : null;

  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: transformedEntity,
    initialFormData: {
      nombre: '',
      sku: '',
      subcategoriaId: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.nombre)) {
        errors.nombre = mensajesError.textoRequerido('el nombre del producto');
      }

      if (!validarSKU(data.sku)) {
        errors.sku = data.sku?.trim() ? mensajesError.skuInvalido : 'Por favor ingresá el SKU';
      }

      if (!data.subcategoriaId) {
        errors.subcategoriaId = 'Por favor seleccioná una subcategoría';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => ({
      Nombre: data.nombre.trim(),
      SKU: data.sku.trim(),
      nc_1g29__Subcategorias_id: data.subcategoriaId
    }),
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await updateRecord(TABLES.productos, id, data);
      } else {
        await createRecord(TABLES.productos, data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
      setSelectedCategoria('');
    },
    messages: {
      created: 'Producto creado exitosamente',
      updated: 'Producto actualizado exitosamente',
      error: 'Error al guardar el producto'
    }
  });

  // Sincronizar categoría seleccionada al cambiar producto
  useEffect(() => {
    if (product) {
      const subcategoriaId = product.fields.Subcategoria?.id || '';
      const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
      const categoriaId = subcategoria?.fields.nc_1g29__Categorias_id || '';
      setSelectedCategoria(categoriaId);
    } else {
      setSelectedCategoria('');
    }
  }, [product, subcategorias]);

  const filteredSubcategorias = useMemo(() => {
    if (!selectedCategoria) return [];
    return subcategorias.filter(sub => sub.fields.nc_1g29__Categorias_id == selectedCategoria);
  }, [selectedCategoria, subcategorias]);

  const handleCategoriaChange = (newCategoriaId) => {
    setSelectedCategoria(newCategoriaId);
    updateField('subcategoriaId', '');
  };

  if (!show) return null;

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
              onChange={(e) => updateField('nombre', e.target.value)}
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
              onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
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
              onChange={(e) => updateField('subcategoriaId', e.target.value)}
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