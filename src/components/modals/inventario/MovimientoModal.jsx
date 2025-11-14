'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { useProductSearch } from '@/components/modals/presupuestos/hooks/useProductSearch';
import { crearMovimiento } from '@/services/index';
import { validarTextoRequerido, validarNumeroPositivo, mensajesError } from '@/lib/utils/validation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';

const TIPOS_MOVIMIENTO = [
  { value: 'Entrada', label: 'Entrada' },
  { value: 'Salida', label: 'Salida' },
  { value: 'Consolidado', label: 'Consolidado' }
];

const MOTIVOS = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Compra', label: 'Compra' },
  { value: 'Ajuste de inventario', label: 'Ajuste de inventario' }
];

export default function MovimientoModal({ show, producto = null, onClose, onSaved }) {
  const [selectedTipo, setSelectedTipo] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Hook de búsqueda de productos
  const {
    searchTerm,
    setSearchTerm,
    productos,
    loadingProductos,
    totalProductos
  } = useProductSearch(show);

  // Crear initialFormData de forma estable (sin dependencias de producto)
  const initialFormDataMemo = useMemo(() => ({
    productoId: '',
    tipo: '',
    motivo: '',
    cantidad: '',
    detalle: ''
  }), []);

  const {
    formData,
    updateField,
    handleSave,
    saving,
    errors: validationErrors
  } = useFormModal({
    entity: null, // Siempre es creación
    initialFormData: initialFormDataMemo,
    validate: (data) => {
      const errors = {};

      if (!data || typeof data !== 'object') {
        return { valid: false, errors: { general: 'Datos inválidos' } };
      }

      if (!data.productoId) {
        errors.productoId = 'Por favor seleccioná un producto';
      }

      if (!data.tipo) {
        errors.tipo = 'Por favor seleccioná un tipo de movimiento';
      }

      if (!data.motivo) {
        errors.motivo = 'Por favor seleccioná un motivo';
      }

      if (!data.cantidad || data.cantidad === '' || data.cantidad === '0') {
        errors.cantidad = 'Por favor ingresá una cantidad válida';
      } else {
        const cantidadNum = parseFloat(data.cantidad);
        if (isNaN(cantidadNum)) {
          errors.cantidad = 'La cantidad debe ser un número válido';
        } else {
          // Validaciones específicas por tipo
          if (data.tipo === 'Entrada' && cantidadNum < 0) {
            errors.cantidad = 'Para entradas, la cantidad debe ser positiva';
          }

          if (data.tipo === 'Salida' && cantidadNum > 0) {
            errors.cantidad = 'Para salidas, la cantidad debe ser negativa';
          }
        }
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },
    transformData: (data) => {
      console.log('=== transformData ===');
      console.log('data recibida:', data);
      console.log('data.productoId:', data.productoId);
      console.log('typeof data.productoId:', typeof data.productoId);

      let cantidadFinal = parseFloat(data.cantidad);
      console.log('cantidad parseada:', cantidadFinal);

      // Asegurar el signo correcto según el tipo
      if (data.tipo === 'Entrada') {
        cantidadFinal = Math.abs(cantidadFinal);
      } else if (data.tipo === 'Salida') {
        cantidadFinal = -Math.abs(cantidadFinal);
      }
      console.log('cantidad final:', cantidadFinal);

      const productoIdInt = parseInt(data.productoId);

      const transformed = {
        nc_1g29__Productos_id: productoIdInt,
        Tipo: data.tipo,
        Motivo: data.motivo,
        Cantidad: cantidadFinal,
        Detalle: data.detalle && data.detalle.trim() !== '' ? data.detalle.trim() : null
      };

      console.log('datos transformados:', transformed);
      console.log('nc_1g29__Productos_id type:', typeof transformed.nc_1g29__Productos_id);
      console.log('nc_1g29__Productos_id value:', transformed.nc_1g29__Productos_id);
      return transformed;
    },
    onSave: async (data) => {
      console.log('=== onSave ===');
      console.log('datos a guardar:', data);

      try {
        const resultado = await crearMovimiento(data);
        console.log('resultado de crearMovimiento:', resultado);
        return resultado;
      } catch (error) {
        console.error('ERROR en crearMovimiento:', error);
        console.error('error.message:', error.message);
        console.error('error.stack:', error.stack);
        throw error;
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
      setSelectedTipo('');
    },
    messages: {
      created: 'Movimiento registrado correctamente',
      error: 'Error al registrar el movimiento'
    }
  });

  // Sincronizar el tipo seleccionado
  React.useEffect(() => {
    setSelectedTipo(formData.tipo);
  }, [formData.tipo]);

  // Setear producto inicial si viene preseleccionado
  React.useEffect(() => {
    if (show && producto?.id) {
      updateField('productoId', producto.id);
      setSearchTerm(producto.fields?.Nombre || '');
    }
  }, [producto?.id, show, updateField]);

  // Cerrar dropdown cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setShowDropdown(false);
      setSearchTerm('');
    }
  }, [show]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      if (inputRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setShowDropdown(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelectProducto = (prod) => {
    updateField('productoId', prod.id);
    setSearchTerm(prod.fields?.Nombre || '');
    setShowDropdown(false);
  };

  // Mensaje de ayuda según el tipo seleccionado
  const cantidadHelperText = useMemo(() => {
    if (!selectedTipo) return '';

    switch (selectedTipo) {
      case 'Entrada':
        return 'Ingresá una cantidad positiva (ej: 10)';
      case 'Salida':
        return 'Ingresá una cantidad negativa (ej: -5)';
      case 'Consolidado':
        return 'Ingresá cantidad positiva para aumentar o negativa para disminuir';
      default:
        return '';
    }
  }, [selectedTipo]);

  // Los productos ya vienen filtrados del hook
  const productosFiltrados = productos;

  // Producto actualmente seleccionado
  const productoSeleccionado = useMemo(() => {
    if (!formData.productoId) return null;
    return productos.find(p => p.id === formData.productoId);
  }, [formData.productoId, productos]);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento de Stock</DialogTitle>
          <DialogDescription asChild>
            <span>Registrá una entrada, salida o ajuste de inventario</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }} className="space-y-4">
          {/* Selector de Producto con búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="productoId">
              Producto <span className="text-destructive">*</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {loadingProductos ? (
                  <Loader2 className="inline-block h-3 w-3 animate-spin" />
                ) : (
                  `(${totalProductos} ${searchTerm ? 'encontrados' : 'disponibles'})`
                )}
              </span>
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="productoId"
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (productosFiltrados.length > 0 && !showDropdown) {
                    setShowDropdown(true);
                  }
                  // Limpiar selección al cambiar búsqueda
                  if (formData.productoId && e.target.value !== productoSeleccionado?.fields?.Nombre) {
                    updateField('productoId', '');
                  }
                }}
                onFocus={() => {
                  if (productosFiltrados.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onClick={() => {
                  if (productosFiltrados.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                disabled={!!producto}
                className={validationErrors.productoId ? 'border-destructive' : ''}
              />

              {/* Dropdown de productos */}
              {showDropdown && productosFiltrados.length > 0 && !producto && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-50"
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                >
                  {productosFiltrados.map(prod => (
                    <Button
                      key={prod.id}
                      type="button"
                      variant="ghost"
                      onClick={() => handleSelectProducto(prod)}
                      className="w-full justify-start h-auto px-3 py-2 text-sm border-b border-border last:border-b-0 rounded-none"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Package size={16} className="text-muted-foreground shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">
                            <Badge variant="outline" className="font-mono mr-2">{prod.fields?.SKU}</Badge>
                            {prod.fields?.Nombre}
                          </div>
                          {prod.fields?.Descripcion && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {prod.fields.Descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.productoId && (
              <p className="text-sm text-destructive">{validationErrors.productoId}</p>
            )}
          </div>

          {/* Tipo de Movimiento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Movimiento <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => updateField('tipo', value)}
            >
              <SelectTrigger id="tipo" className={validationErrors.tipo ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccioná el tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_MOVIMIENTO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.tipo && (
              <p className="text-sm text-destructive">{validationErrors.tipo}</p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) => updateField('motivo', value)}
            >
              <SelectTrigger id="motivo" className={validationErrors.motivo ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccioná el motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((motivo) => (
                  <SelectItem key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.motivo && (
              <p className="text-sm text-destructive">{validationErrors.motivo}</p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">
              Cantidad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cantidad"
              type="number"
              step="any"
              placeholder="0"
              value={formData.cantidad}
              onChange={(e) => updateField('cantidad', e.target.value)}
              className={validationErrors.cantidad ? 'border-destructive' : ''}
            />
            {cantidadHelperText && !validationErrors.cantidad && (
              <p className="text-xs text-muted-foreground">{cantidadHelperText}</p>
            )}
            {validationErrors.cantidad && (
              <p className="text-sm text-destructive">{validationErrors.cantidad}</p>
            )}
          </div>

          {/* Detalle */}
          <div className="space-y-2">
            <Label htmlFor="detalle">Detalle (opcional)</Label>
            <Textarea
              id="detalle"
              placeholder="Descripción adicional o referencia..."
              value={formData.detalle}
              onChange={(e) => updateField('detalle', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Movimiento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
