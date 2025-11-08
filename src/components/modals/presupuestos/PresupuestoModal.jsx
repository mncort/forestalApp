'use client'
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { crearPresupuesto, actualizarPresupuesto, getClientes } from '@/services/index';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {presupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            {loadingClientes ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando clientes...</span>
              </div>
            ) : (
              <Select
                value={selectedClienteId}
                onValueChange={(value) => setSelectedClienteId(value)}
                disabled={saving}
              >
                <SelectTrigger id="cliente">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.fields.Nombre}
                      {cliente.fields.CUIT && ` - ${cliente.fields.CUIT}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {clientes.length === 0 && !loadingClientes && (
              <p className="text-sm text-yellow-600">
                No hay clientes registrados. Crea uno primero en la sección Clientes.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              type="text"
              value={formData.Descripcion}
              onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
              disabled={saving}
              placeholder="Descripción opcional del presupuesto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.Estado}
              onValueChange={(value) => setFormData({ ...formData, Estado: value })}
              disabled={saving}
            >
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoPago">Tipo de Pago</Label>
            <Select
              value={formData.efectivo.toString()}
              onValueChange={(value) => setFormData({ ...formData, efectivo: value === 'true' })}
              disabled={saving}
            >
              <SelectTrigger id="tipoPago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Tarjeta/Transferencia (IVA 21%)</SelectItem>
                <SelectItem value="true">Efectivo (IVA 10.5%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formData.efectivo ? 'Medio IVA aplicado (10.5%)' : 'IVA completo aplicado (21%)'}
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : (presupuesto ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
