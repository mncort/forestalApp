'use client'
import React, { useMemo } from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { crearCategoria, actualizarCategoria } from '@/services/index';
import { validarTextoRequerido, validarNumeroPositivo, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function CategoryModal({ show, category, onClose, onSaved }) {
  // Transformar datos de la entidad para el hook - Memoizado para evitar ciclos infinitos
  const transformedEntity = useMemo(() => {
    if (!category) return null;

    return {
      id: category.id,
      fields: {
        categoria: category.fields?.Categoria || '',
        markup: category.fields?.Markup || ''
      }
    };
  }, [category]);

  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: transformedEntity,
    initialFormData: {
      categoria: '',
      markup: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.categoria)) {
        errors.categoria = mensajesError.textoRequerido('el nombre de la categoría');
      }

      if (!validarNumeroPositivo(data.markup, true)) {
        errors.markup = mensajesError.markupInvalido;
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => ({
      Categoria: data.categoria.trim(),
      Markup: parseFloat(data.markup)
    }),
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await actualizarCategoria(id, data);
      } else {
        await crearCategoria(data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Categoría creada exitosamente',
      updated: 'Categoría actualizada exitosamente',
      error: 'Error al guardar la categoría'
    }
  });

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Actualiza los datos de la categoría' : 'Completa los datos de la nueva categoría'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Nombre de la Categoría *</Label>
            <Input
              id="categoria"
              type="text"
              value={formData.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              placeholder="Ej: Maderas, Herramientas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup">Porcentaje de Ganancia (%) *</Label>
            <div className="flex">
              <Input
                id="markup"
                type="number"
                step="0.01"
                min="0"
                value={formData.markup}
                onChange={(e) => updateField('markup', e.target.value)}
                className="rounded-r-none"
                placeholder="0.00"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Este porcentaje se aplicará para calcular el precio de venta</p>
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