'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { crearProducto, actualizarProducto } from '@/services/index';
import { validarTextoRequerido, validarSKU, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function ProductModal({ show, product, categorias, subcategorias, onClose, onSaved }) {
  const [selectedCategoria, setSelectedCategoria] = useState('');

  // Transformar datos de la entidad para el hook - Memoizado para evitar ciclos infinitos
  const transformedEntity = useMemo(() => {
    if (!product) return null;

    return {
      id: product.id,
      fields: {
        nombre: product.fields?.Nombre || '',
        sku: product.fields?.SKU || '',
        subcategoriaId: product.fields?.Subcategoria?.id || ''
      }
    };
  }, [product]);

  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: transformedEntity,
    initialFormData: {
      nombre: '',
      sku: '',
      subcategoriaId: ''
    },
    validate: (data) => {
      const errors = {};

      // Usar validaciones centralizadas
      if (!validarTextoRequerido(data.nombre)) {
        errors.nombre = mensajesError.textoRequerido('el nombre del producto');
      }

      if (!validarSKU(data.sku)) {
        errors.sku = data.sku?.trim() ? mensajesError.skuInvalido : 'Por favor ingresá el SKU';
      }

      if (!data.subcategoriaId) {
        errors.subcategoriaId = 'Por favor seleccioná una subcategoría';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => ({
      Nombre: data.nombre.trim(),
      SKU: data.sku.trim(),
      nc_1g29__Subcategorias_id: data.subcategoriaId
    }),
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await actualizarProducto(id, data);
      } else {
        await crearProducto(data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
      setSelectedCategoria('');
    },
    messages: {
      created: 'Producto creado exitosamente',
      updated: 'Producto actualizado exitosamente',
      error: 'Error al guardar el producto'
    }
  });

  // Sincronizar categoría seleccionada al cambiar producto
  useEffect(() => {
    if (product) {
      const subcategoriaId = product.fields.Subcategoria?.id || '';
      const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
      const categoriaId = subcategoria?.fields.nc_1g29__Categorias_id || '';
      setSelectedCategoria(categoriaId);
    } else {
      setSelectedCategoria('');
    }
  }, [product, subcategorias]);

  const filteredSubcategorias = useMemo(() => {
    if (!selectedCategoria) return [];
    return subcategorias.filter(sub => sub.fields.nc_1g29__Categorias_id == selectedCategoria);
  }, [selectedCategoria, subcategorias]);

  const handleCategoriaChange = (newCategoriaId) => {
    setSelectedCategoria(newCategoriaId);
    updateField('subcategoriaId', '');
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Actualiza los datos del producto' : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto *</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
              placeholder="Ej: Tabla de Pino 2x4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Código) *</Label>
            <Input
              id="sku"
              type="text"
              value={formData.sku}
              onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
              className="font-mono"
              placeholder="Ej: PINO-2X4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={selectedCategoria}
              onValueChange={handleCategoriaChange}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Seleccionar categoría..." />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.fields.Categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategoria">Subcategoría *</Label>
            <Select
              value={formData.subcategoriaId}
              onValueChange={(value) => updateField('subcategoriaId', value)}
              disabled={!selectedCategoria}
            >
              <SelectTrigger id="subcategoria">
                <SelectValue placeholder={
                  selectedCategoria ? 'Seleccionar subcategoría...' : 'Primero selecciona una categoría'
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredSubcategorias.map(subcat => (
                  <SelectItem key={subcat.id} value={subcat.id}>
                    {subcat.fields.Subcategoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategoria && filteredSubcategorias.length === 0 && (
              <p className="text-sm text-yellow-600">Esta categoría no tiene subcategorías aún</p>
            )}
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