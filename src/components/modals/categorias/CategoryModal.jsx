'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';
import { validarTextoRequerido, validarNumeroPositivo, mensajesError } from '@/lib/utils/validation';

export default function CategoryModal({ show, category, onClose, onSaved }) {
  // Transformar datos de la entidad para el hook
  const transformedEntity = category ? {
    fields: {
      categoria: category.fields?.Categoria || '',
      markup: category.fields?.Markup || ''
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
      categoria: '',
      markup: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.categoria)) {
        errors.categoria = mensajesError.textoRequerido('el nombre de la categoría');
      }

      if (!validarNumeroPositivo(data.markup, true)) {
        errors.markup = mensajesError.markupInvalido;
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => ({
      Categoria: data.categoria.trim(),
      Markup: parseFloat(data.markup)
    }),
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await updateRecord(TABLES.categorias, id, data);
      } else {
        await createRecord(TABLES.categorias, data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Categoría creada exitosamente',
      updated: 'Categoría actualizada exitosamente',
      error: 'Error al guardar la categoría'
    }
  });

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        <p className="py-2 text-sm text-base-content/70">
          {isEditMode ? 'Actualiza los datos de la categoría' : 'Completa los datos de la nueva categoría'}
        </p>

        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre de la Categoría *</span>
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Maderas, Herramientas"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Porcentaje de Ganancia (%) *</span>
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
              <span className="label-text-alt">Este porcentaje se aplicará para calcular el precio de venta</span>
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