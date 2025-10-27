'use client'
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { crearCliente, actualizarCliente, validarCUIT, validarEmail } from '@/lib/api/index';
import { X } from 'lucide-react';

export default function ClienteModal({ show, cliente, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    Nombre: '',
    CUIT: '',
    CondicionIVA: '',
    Email: '',
    Tel: '',
    Dirección: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        Nombre: cliente.fields?.Nombre || '',
        CUIT: cliente.fields?.CUIT || '',
        CondicionIVA: cliente.fields?.CondicionIVA || '',
        Email: cliente.fields?.Email || '',
        Tel: cliente.fields?.Tel || '',
        Dirección: cliente.fields?.Dirección || ''
      });
    } else {
      setFormData({
        Nombre: '',
        CUIT: '',
        CondicionIVA: '',
        Email: '',
        Tel: '',
        Dirección: ''
      });
    }
  }, [cliente]);

  if (!show) return null;

  const isEditMode = !!cliente;

  const handleSave = async () => {
    // Validaciones
    if (!formData.Nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.CUIT && !validarCUIT(formData.CUIT)) {
      toast.error('Formato de CUIT inválido. Formato esperado: 20-12345678-9');
      return;
    }

    if (formData.Email && !validarEmail(formData.Email)) {
      toast.error('Formato de email inválido');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await actualizarCliente(cliente.id, formData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await crearCliente(formData);
        toast.success('Cliente creado exitosamente');
      }

      await onSaved();
      onClose();
      setFormData({
        Nombre: '',
        CUIT: '',
        CondicionIVA: '',
        Email: '',
        Tel: '',
        Dirección: ''
      });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

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
              onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, CUIT: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, CondicionIVA: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, Tel: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, Dirección: e.target.value })}
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
