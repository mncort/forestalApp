'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { crearCliente, actualizarCliente } from '@/lib/api/index';
import { validarTextoRequerido, validarCUIT, validarEmail, mensajesError } from '@/lib/utils/validation';
import { X } from 'lucide-react';

export default function ClienteModal({ show, cliente, onClose, onSaved }) {
  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: cliente,
    initialFormData: {
      Nombre: '',
      CUIT: '',
      CondicionIVA: '',
      Email: '',
      Tel: '',
      Dirección: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.Nombre)) {
        errors.Nombre = mensajesError.requerido('El nombre');
      }

      if (data.CUIT && !validarCUIT(data.CUIT, false)) {
        errors.CUIT = mensajesError.cuitInvalido;
      }

      if (data.Email && !validarEmail(data.Email, false)) {
        errors.Email = mensajesError.emailInvalido;
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await actualizarCliente(id, data);
      } else {
        await crearCliente(data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Cliente creado exitosamente',
      updated: 'Cliente actualizado exitosamente',
      error: 'Error al guardar el cliente'
    }
  });

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-base-content/70 mb-4">
          {isEditMode ? 'Actualiza los datos del cliente' : 'Completa los datos del nuevo cliente'}
        </p>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre *</span>
            </label>
            <input
              type="text"
              value={formData.Nombre}
              onChange={(e) => updateField('Nombre', e.target.value)}
              className="input input-bordered w-full"
              placeholder="Nombre del cliente"
              disabled={saving}
            />
          </div>

          {/* CUIT */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">CUIT</span>
            </label>
            <input
              type="text"
              value={formData.CUIT}
              onChange={(e) => updateField('CUIT', e.target.value)}
              className="input input-bordered w-full"
              placeholder="20-12345678-9"
              disabled={saving}
            />
            <label className="label">
              <span className="label-text-alt">Formato: 20-12345678-9</span>
            </label>
          </div>

          {/* Condición IVA */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Condición IVA</span>
            </label>
            <select
              value={formData.CondicionIVA}
              onChange={(e) => updateField('CondicionIVA', e.target.value)}
              className="select select-bordered w-full"
              disabled={saving}
            >
              <option value="">Seleccionar</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributo">Monotributo</option>
              <option value="Exento">Exento</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => updateField('Email', e.target.value)}
              className="input input-bordered w-full"
              placeholder="cliente@ejemplo.com"
              disabled={saving}
            />
          </div>

          {/* Teléfono */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Teléfono</span>
            </label>
            <input
              type="tel"
              value={formData.Tel}
              onChange={(e) => updateField('Tel', e.target.value)}
              className="input input-bordered w-full"
              placeholder="+54911234567"
              disabled={saving}
            />
          </div>

          {/* Dirección */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Dirección</span>
            </label>
            <textarea
              value={formData.Dirección}
              onChange={(e) => updateField('Dirección', e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Dirección completa"
              rows="2"
              disabled={saving}
            />
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
