'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';
import { validarTextoRequerido, mensajesError } from '@/lib/utils/validation';

export default function SubcategoryModal({ show, subcategoria, categoriaId, onClose, onSaved }) {
  // Transformar datos de la entidad para el hook
  const transformedEntity = subcategoria ? {
    fields: {
      subcategoria: subcategoria.fields?.Subcategoria || '',
      descripcion: subcategoria.fields?.Descripcion || '',
      markup: subcategoria.fields?.Markup || ''
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
      subcategoria: '',
      descripcion: '',
      markup: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.subcategoria)) {
        errors.subcategoria = mensajesError.textoRequerido('el nombre de la subcategoría');
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => {
      const recordData = {
        Subcategoria: data.subcategoria.trim(),
        Descripcion: data.descripcion.trim() || null,
        Markup: data.markup ? parseFloat(data.markup) : null
      };

      // Agregar relación con categoría solo en modo creación
      if (!subcategoria && categoriaId) {
        recordData.nc_1g29__Categorias_id = categoriaId;
      }

      return recordData;
    },
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await updateRecord(TABLES.subcategorias, id, data);
      } else {
        await createRecord(TABLES.subcategorias, data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Subcategoría creada exitosamente',
      updated: 'Subcategoría actualizada exitosamente',
      error: 'Error al guardar la subcategoría'
    }
  });

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
        </h3>
        <p className="py-2 text-sm text-base-content/70">
          {isEditMode ? 'Actualiza los datos de la subcategoría' : 'Completa los datos de la nueva subcategoría'}
        </p>

        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre de la Subcategoría *</span>
            </label>
            <input
              type="text"
              value={formData.subcategoria}
              onChange={(e) => updateField('subcategoria', e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Pinos, Eucaliptos"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción (opcional)</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => updateField('descripcion', e.target.value)}
              className="textarea textarea-bordered w-full h-24"
              placeholder="Descripción de la subcategoría..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Porcentaje de Ganancia (%) - Opcional</span>
            </label>
            <label className="input-group">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.markup}
                onChange={(e) => updateField('markup', e.target.value)}
                className="input input-bordered w-full"
                placeholder="0.00"
              />
              <span>%</span>
            </label>
            <label className="label">
              <span className="label-text-alt">Si no se especifica, se usará el markup de la categoría</span>
            </label>
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