'use client'
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';

export default function SubcategoryModal({ show, subcategoria, categoriaId, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    subcategoria: '',
    descripcion: '',
    markup: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subcategoria) {
      // Modo edición
      setFormData({
        subcategoria: subcategoria.fields.Subcategoria || '',
        descripcion: subcategoria.fields.Descripcion || '',
        markup: subcategoria.fields.Markup || ''
      });
    } else {
      // Modo creación
      setFormData({
        subcategoria: '',
        descripcion: '',
        markup: ''
      });
    }
  }, [subcategoria]);

  if (!show) return null;

  const isEditMode = !!subcategoria;

  const handleSave = async () => {
    if (!formData.subcategoria.trim()) {
      toast.error('Por favor ingresá el nombre de la subcategoría');
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        Subcategoria: formData.subcategoria.trim(),
        Descripcion: formData.descripcion.trim() || null,
        Markup: formData.markup ? parseFloat(formData.markup) : null
      };

      if (isEditMode) {
        // Actualizar subcategoría existente
        await updateRecord(TABLES.subcategorias, subcategoria.id, recordData);
        toast.success('Subcategoría actualizada exitosamente');
      } else {
        // Crear nueva subcategoría - necesita la relación con la categoría
        recordData.nc_1g29__Categorias_id = categoriaId;
        await createRecord(TABLES.subcategorias, recordData);
        toast.success('Subcategoría creada exitosamente');
      }

      await onSaved();
      onClose();
      setFormData({ subcategoria: '', descripcion: '', markup: '' });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al guardar la subcategoría');
    } finally {
      setSaving(false);
    }
  };

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
              onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, markup: e.target.value })}
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