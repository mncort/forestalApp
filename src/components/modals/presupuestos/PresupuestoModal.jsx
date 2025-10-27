'use client'
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { crearPresupuesto, actualizarPresupuesto, getClientes } from '@/lib/api/index';

export default function PresupuestoModal({ show, presupuesto, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    Cliente: '',
    Descripcion: '',
    Estado: 'Borrador'
  });
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Cargar lista de clientes cuando se abre el modal
  useEffect(() => {
    if (show) {
      const cargarClientes = async () => {
        setLoadingClientes(true);
        try {
          const clientesData = await getClientes({ limit: 100 });
          setClientes(clientesData);
        } catch (error) {
          console.error('Error cargando clientes:', error);
        } finally {
          setLoadingClientes(false);
        }
      };

      cargarClientes();

      if (presupuesto) {
        // Modo edición
        setFormData({
          Cliente: presupuesto.fields.Cliente || '',
          Descripcion: presupuesto.fields.Descripcion || '',
          Estado: presupuesto.fields.Estado || 'Borrador'
        });
      } else {
        // Modo creación
        setFormData({
          Cliente: '',
          Descripcion: '',
          Estado: 'Borrador'
        });
      }
    }
  }, [show, presupuesto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (presupuesto) {
        // Actualizar
        await actualizarPresupuesto(presupuesto.id, formData);
      } else {
        // Crear
        await crearPresupuesto(formData);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      alert('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {presupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-square"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cliente *</span>
            </label>
            {loadingClientes ? (
              <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-sm">Cargando clientes...</span>
              </div>
            ) : (
              <select
                value={formData.Cliente}
                onChange={(e) => setFormData({ ...formData, Cliente: e.target.value })}
                className="select select-bordered"
                required
                disabled={saving}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.fields.Nombre}>
                    {cliente.fields.Nombre}
                    {cliente.fields.CUIT && ` - ${cliente.fields.CUIT}`}
                  </option>
                ))}
              </select>
            )}
            {clientes.length === 0 && !loadingClientes && (
              <label className="label">
                <span className="label-text-alt text-warning">
                  No hay clientes registrados. Crea uno primero en la sección Clientes.
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              value={formData.Descripcion}
              onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
              className="textarea textarea-bordered"
              disabled={saving}
              rows={3}
              placeholder="Descripción opcional del presupuesto"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Estado</span>
            </label>
            <select
              value={formData.Estado}
              onChange={(e) => setFormData({ ...formData, Estado: e.target.value })}
              className="select select-bordered"
              disabled={saving}
            >
              <option value="Borrador">Borrador</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Guardando...
                </>
              ) : (
                presupuesto ? 'Actualizar' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
