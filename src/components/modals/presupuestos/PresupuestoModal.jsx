'use client'
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { crearPresupuesto, actualizarPresupuesto, getClientes } from '@/lib/api/index';
import toast from 'react-hot-toast';

export default function PresupuestoModal({ show, presupuesto, onClose, onSaved }) {
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [formData, setFormData] = useState({
    Descripcion: '',
    Estado: 'Borrador',
    efectivo: false
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
        // Modo edición - obtener el ID del cliente desde la relación
        const clienteId = presupuesto.fields.nc_1g29__Clientes_id || '';
        setSelectedClienteId(clienteId);
        setFormData({
          Descripcion: presupuesto.fields.Descripcion || '',
          Estado: presupuesto.fields.Estado || 'Borrador',
          // NocoDB devuelve checkbox como número (0/1), convertir a booleano
          efectivo: presupuesto.fields.efectivo !== undefined
            ? Boolean(presupuesto.fields.efectivo)
            : false
        });
      } else {
        // Modo creación
        setSelectedClienteId('');
        setFormData({
          Descripcion: '',
          Estado: 'Borrador',
          efectivo: false
        });
      }
    }
  }, [show, presupuesto]);

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setSelectedClienteId(clienteId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClienteId) {
      toast.error('Debes seleccionar un cliente');
      return;
    }

    setSaving(true);

    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        nc_1g29__Clientes_id: selectedClienteId
      };

      if (presupuesto) {
        // Actualizar
        await actualizarPresupuesto(presupuesto.id, dataToSend);
        toast.success('Presupuesto actualizado correctamente');
      } else {
        // Crear
        await crearPresupuesto(dataToSend);
        toast.success('Presupuesto creado correctamente');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      toast.error('Error al guardar el presupuesto');
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
                value={selectedClienteId}
                onChange={handleClienteChange}
                className="select select-bordered"
                required
                disabled={saving}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
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

          <div className="form-control">
            <label className="label">
              <span className="label-text">Tipo de Pago</span>
            </label>
            <select
              value={formData.efectivo.toString()}
              onChange={(e) => setFormData({ ...formData, efectivo: e.target.value === 'true' })}
              className="select select-bordered"
              disabled={saving}
            >
              <option value="false">Tarjeta/Transferencia (IVA 21%)</option>
              <option value="true">Efectivo (IVA 10.5%)</option>
            </select>
            <label className="label">
              <span className="label-text-alt">
                {formData.efectivo ? 'Medio IVA aplicado (10.5%)' : 'IVA completo aplicado (21%)'}
              </span>
            </label>
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
