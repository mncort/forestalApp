'use client'
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { NOCODB_URL, HEADERS, TABLES } from '@/lib/nocodb-config';
import { getCostosByProducto, updateRecord } from '@/lib/api/index';

export default function CostModal({ show, product, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    costo: '',
    moneda: 'ARS',
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: ''
  });
  const [saving, setSaving] = useState(false);

  if (!show || !product) return null;

  const handleSave = async () => {
    if (!formData.costo) {
      toast.error('Por favor ingresá un costo');
      return;
    }

    if (parseFloat(formData.costo) <= 0) {
      toast.error('El costo debe ser mayor a 0');
      return;
    }

    if (!formData.fechaDesde) {
      toast.error('Por favor ingresá una fecha de inicio');
      return;
    }

    setSaving(true);
    try {
      // 1. Buscar si existe un costo previo sin fecha hasta
      const costosProducto = await getCostosByProducto(product.id);
      console.log('Costos encontrados:', costosProducto);

      const costoPrevioSinCierre = costosProducto.find(
        c => !c.fields.FechaHasta || c.fields.FechaHasta === ''
      );

      console.log('Costo previo sin cierre:', costoPrevioSinCierre);

      // 2. Si existe un costo previo sin cerrar, actualizarlo con el día anterior al nuevo costo
      if (costoPrevioSinCierre) {
        // Calcular el día anterior a la fecha desde del nuevo costo
        // Usar formato YYYY-MM-DD directamente para evitar problemas de zona horaria
        const [year, month, day] = formData.fechaDesde.split('-').map(Number);
        const fechaHastaPrevio = new Date(year, month - 1, day - 1);

        const fechaHastaStr = fechaHastaPrevio.toISOString().split('T')[0];
        console.log('Fecha hasta para costo previo:', fechaHastaStr);

        // Actualizar el costo previo usando la función updateRecord
        try {
          await updateRecord(TABLES.costos, costoPrevioSinCierre.id, {
            FechaHasta: fechaHastaStr
          });
          console.log('Costo previo actualizado exitosamente');
        } catch (updateError) {
          console.error('Error al actualizar costo previo:', updateError);
          toast.error('Error al cerrar el costo previo');
          setSaving(false);
          return;
        }
      }

      // 3. Crear el nuevo costo
      const response = await fetch(`${NOCODB_URL}/api/v2/tables/${TABLES.costos}/records`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          Costo: parseFloat(formData.costo),
          Moneda: formData.moneda,
          FechaDesde: formData.fechaDesde,
          FechaHasta: formData.fechaHasta || null,
          nc_1g29__Productos_id: product.id
        })
      });

      if (response.ok) {
        await onSaved();
        onClose();
        setFormData({ costo: '', moneda: 'ARS', fechaDesde: new Date().toISOString().split('T')[0], fechaHasta: '' });
        toast.success(costoPrevioSinCierre
          ? 'Costo guardado y costo anterior cerrado exitosamente'
          : 'Costo guardado exitosamente'
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al crear costo:', errorData);
        toast.error(errorData.message || 'Error al guardar el costo');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

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
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
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