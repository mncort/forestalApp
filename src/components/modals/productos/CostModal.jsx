'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { NOCODB_URL, HEADERS, TABLES } from '@/lib/nocodb-config';
import { getCostosByProducto, updateRecord, createRecord } from '@/lib/api/index';
import { validarNumeroPositivo, mensajesError } from '@/lib/utils/validation';

export default function CostModal({ show, product, onClose, onSaved }) {
  const { formData, updateField, handleSave, saving } = useFormModal({
    entity: null, // Always create mode for costs
    initialFormData: {
      costo: '',
      moneda: 'ARS',
      fechaDesde: new Date().toISOString().split('T')[0],
      fechaHasta: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!data.costo) {
        errors.costo = 'Por favor ingresá un costo';
      } else if (!validarNumeroPositivo(data.costo, false)) {
        errors.costo = mensajesError.costoMayorCero;
      }

      if (!data.fechaDesde) {
        errors.fechaDesde = 'Por favor ingresá una fecha de inicio';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    },
    transformData: (data) => ({
      Costo: parseFloat(data.costo),
      Moneda: data.moneda,
      FechaDesde: data.fechaDesde,
      FechaHasta: data.fechaHasta || null,
      nc_1g29__Productos_id: product?.id
    }),
    onSave: async (data) => {
      // 1. Buscar si existe un costo previo sin fecha hasta
      const costosProducto = await getCostosByProducto(product.id);

      const costoPrevioSinCierre = costosProducto.find(
        c => !c.fields.FechaHasta || c.fields.FechaHasta === ''
      );

      // 2. Si existe un costo previo sin cerrar, actualizarlo con el día anterior al nuevo costo
      if (costoPrevioSinCierre) {
        // Calcular el día anterior a la fecha desde del nuevo costo
        const [year, month, day] = data.FechaDesde.split('-').map(Number);
        const fechaHastaPrevio = new Date(year, month - 1, day - 1);
        const fechaHastaStr = fechaHastaPrevio.toISOString().split('T')[0];

        // Actualizar el costo previo
        await updateRecord(TABLES.costos, costoPrevioSinCierre.id, {
          FechaHasta: fechaHastaStr
        });
      }

      // 3. Crear el nuevo costo
      await createRecord(TABLES.costos, data);

      // Return flag to customize success message
      return { costoPrevioSinCierre };
    },
    onSuccess: async (result) => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Costo guardado exitosamente',
      updated: 'Costo actualizado exitosamente'
    }
  });

  if (!show || !product) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Asignar Costo</h3>
        <p className="py-2 text-sm text-base-content/70">{product.fields.Nombre}</p>

        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Costo *</span>
            </label>
            <label className="input-group">
              <span>$</span>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => updateField('costo', e.target.value)}
                className="input input-bordered w-full"
                placeholder="0.00"
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Moneda</span>
            </label>
            <select
              value={formData.moneda}
              onChange={(e) => updateField('moneda', e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dólar</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Desde *</span>
            </label>
            <input
              type="date"
              value={formData.fechaDesde}
              onChange={(e) => updateField('fechaDesde', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Hasta (opcional)</span>
            </label>
            <input
              type="date"
              value={formData.fechaHasta}
              onChange={(e) => updateField('fechaHasta', e.target.value)}
              className="input input-bordered w-full"
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
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}