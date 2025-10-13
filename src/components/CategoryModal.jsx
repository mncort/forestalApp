'use client'
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';

export default function CategoryModal({ show, category, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    categoria: '',
    markup: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoria: category.fields.Categoria || '',
        markup: category.fields.Markup || ''
      });
    } else {
      setFormData({
        categoria: '',
        markup: ''
      });
    }
  }, [category]);

  if (!show) return null;

  const isEditMode = !!category;

  const handleSave = async () => {
    if (!formData.categoria.trim()) {
      toast.error('Por favor ingresá el nombre de la categoría');
      return;
    }

    if (!formData.markup || parseFloat(formData.markup) < 0) {
      toast.error('Por favor ingresá un porcentaje de ganancia válido');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await updateRecord(TABLES.categorias, category.id, {
          Categoria: formData.categoria.trim(),
          Markup: parseFloat(formData.markup)
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createRecord(TABLES.categorias, {
          Categoria: formData.categoria.trim(),
          Markup: parseFloat(formData.markup)
        });
        toast.success('Categoría creada exitosamente');
      }

      await onSaved();
      onClose();
      setFormData({ categoria: '', markup: '' });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

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
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, markup: e.target.value })}
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