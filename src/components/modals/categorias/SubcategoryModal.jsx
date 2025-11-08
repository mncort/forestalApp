'use client'
import React, { useMemo } from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { crearSubcategoria, actualizarSubcategoria } from '@/services/index';
import { validarTextoRequerido, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function SubcategoryModal({ show, subcategoria, categoriaId, onClose, onSaved }) {
  // Transformar datos de la entidad para el hook - Memoizado para evitar ciclos infinitos
  const transformedEntity = useMemo(() => {
    if (!subcategoria) return null;

    return {
      id: subcategoria.id,
      fields: {
        subcategoria: subcategoria.fields?.Subcategoria || '',
        descripcion: subcategoria.fields?.Descripcion || '',
        markup: subcategoria.fields?.Markup || ''
      }
    };
  }, [subcategoria]);

  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: transformedEntity,
    initialFormData: {
      subcategoria: '',
      descripcion: '',
      markup: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.subcategoria)) {
        errors.subcategoria = mensajesError.textoRequerido('el nombre de la subcategoría');
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => {
      const recordData = {
        Subcategoria: data.subcategoria.trim(),
        Descripcion: data.descripcion.trim() || null,
        Markup: data.markup ? parseFloat(data.markup) : null
      };

      // Agregar relación con categoría solo en modo creación
      if (!subcategoria && categoriaId) {
        recordData.nc_1g29__Categorias_id = categoriaId;
      }

      return recordData;
    },
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await actualizarSubcategoria(id, data);
      } else {
        await crearSubcategoria(data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Subcategoría creada exitosamente',
      updated: 'Subcategoría actualizada exitosamente',
      error: 'Error al guardar la subcategoría'
    }
  });

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Actualiza los datos de la subcategoría' : 'Completa los datos de la nueva subcategoría'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subcategoria">Nombre de la Subcategoría *</Label>
            <Input
              id="subcategoria"
              type="text"
              value={formData.subcategoria}
              onChange={(e) => updateField('subcategoria', e.target.value)}
              placeholder="Ej: Pinos, Eucaliptos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => updateField('descripcion', e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Descripción de la subcategoría..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup">Porcentaje de Ganancia (%) - Opcional</Label>
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
            <p className="text-xs text-muted-foreground">Si no se especifica, se usará el markup de la categoría</p>
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