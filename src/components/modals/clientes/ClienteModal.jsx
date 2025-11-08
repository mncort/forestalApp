'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { crearCliente, actualizarCliente } from '@/services/index';
import { validarTextoRequerido, validarCUIT, validarEmail, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

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

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Actualiza los datos del cliente' : 'Completa los datos del nuevo cliente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.Nombre}
              onChange={(e) => updateField('Nombre', e.target.value)}
              placeholder="Nombre del cliente"
              disabled={saving}
            />
          </div>

          {/* CUIT */}
          <div className="space-y-2">
            <Label htmlFor="cuit">CUIT</Label>
            <Input
              id="cuit"
              type="text"
              value={formData.CUIT}
              onChange={(e) => updateField('CUIT', e.target.value)}
              placeholder="20-12345678-9"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">Formato: 20-12345678-9</p>
          </div>

          {/* Condición IVA */}
          <div className="space-y-2">
            <Label htmlFor="condicion-iva">Condición IVA</Label>
            <Select
              value={formData.CondicionIVA}
              onValueChange={(value) => updateField('CondicionIVA', value)}
              disabled={saving}
            >
              <SelectTrigger id="condicion-iva">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Seleccionar</SelectItem>
                <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                <SelectItem value="Monotributo">Monotributo</SelectItem>
                <SelectItem value="Exento">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.Email}
              onChange={(e) => updateField('Email', e.target.value)}
              placeholder="cliente@ejemplo.com"
              disabled={saving}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.Tel}
              onChange={(e) => updateField('Tel', e.target.value)}
              placeholder="+54911234567"
              disabled={saving}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.Dirección}
              onChange={(e) => updateField('Dirección', e.target.value)}
              placeholder="Dirección completa"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
