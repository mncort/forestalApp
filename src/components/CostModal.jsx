'use client'
import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { NOCODB_URL, HEADERS, TABLES } from '@/lib/nocodb-config';

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
    // Validación
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
        toast.success('Costo guardado exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({}));
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Asignar Costo</h3>
          <p className="text-sm text-gray-600 mt-1">{product.fields.Nombre}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Costo *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              value={formData.moneda}
              onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dólar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde *</label>
            <input
              type="date"
              value={formData.fechaDesde}
              onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta (opcional)</label>
            <input
              type="date"
              value={formData.fechaHasta}
              onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
            disabled={saving}
          >
            {saving && <Loader size={16} className="animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
