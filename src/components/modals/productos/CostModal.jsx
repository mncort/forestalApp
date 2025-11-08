'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { guardarCostoParaProducto } from '@/services/index';
import { validarNumeroPositivo, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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
      return guardarCostoParaProducto(product.id, data);
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

  if (!product) return null;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Costo</DialogTitle>
          <DialogDescription>{product.fields.Nombre}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="costo">Costo *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">
                $
              </span>
              <Input
                id="costo"
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => updateField('costo', e.target.value)}
                className="rounded-l-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda</Label>
            <Select
              value={formData.moneda}
              onValueChange={(value) => updateField('moneda', value)}
            >
              <SelectTrigger id="moneda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                <SelectItem value="USD">USD - Dólar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaDesde">Desde *</Label>
            <Input
              id="fechaDesde"
              type="date"
              value={formData.fechaDesde}
              onChange={(e) => updateField('fechaDesde', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaHasta">Hasta (opcional)</Label>
            <Input
              id="fechaHasta"
              type="date"
              value={formData.fechaHasta}
              onChange={(e) => updateField('fechaHasta', e.target.value)}
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
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
