# Plan de Refactorización - Forestal App

**Fecha:** 28 de Octubre, 2025
**Versión:** 1.0
**Objetivo:** Reducir duplicación, mejorar modularización y facilitar mantenimiento

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Fase 1 - Impacto Rápido](#fase-1---impacto-rápido)
3. [Fase 2 - Modularización](#fase-2---modularización)
4. [Fase 3 - Calidad y Escalabilidad](#fase-3---calidad-y-escalabilidad)
5. [Estructura Final Propuesta](#estructura-final-propuesta)
6. [Checklist de Implementación](#checklist-de-implementación)

---

## Visión General

### Objetivos del Plan

**Reducción de código:**
- De ~2,845 líneas a ~2,000 líneas (-30%)
- De 35% duplicación a <10%

**Mejoras en mantenibilidad:**
- Archivos < 200 líneas (excepto casos justificados)
- Separación clara de responsabilidades
- Código más testeable

**Mejor experiencia de desarrollo:**
- Más fácil agregar nuevas entidades
- Patrones consistentes
- Documentación completa

### Duración Estimada

- **Fase 1:** 1-2 semanas (impacto rápido)
- **Fase 2:** 2-3 semanas (modularización profunda)
- **Fase 3:** 3-4 semanas (calidad y tests)

**Total:** 6-9 semanas de trabajo

---

## Fase 1 - Impacto Rápido

**Duración:** 1-2 semanas
**Objetivo:** Eliminar duplicación y reorganizar responsabilidades

---

### 🎯 Tarea 1.1: Crear Hook `useFormModal` Genérico

**Prioridad:** 🔴 CRÍTICA
**Esfuerzo:** Medio (2-3 días)
**Impacto:** Reducción de ~735 líneas

#### Paso 1: Crear el hook genérico

**Archivo a crear:** `src/hooks/useFormModal.js`

```javascript
'use client'
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook genérico para manejar lógica de modales de formulario CRUD
 *
 * @param {Object} config - Configuración del hook
 * @param {Object} config.entity - Entidad a editar (null para crear)
 * @param {Object} config.initialFormData - Estado inicial del formulario
 * @param {Function} config.onSave - Función para guardar (create o update)
 * @param {Function} config.validate - Función de validación (retorna { valid, errors })
 * @param {Function} config.transformData - Transforma formData antes de guardar (opcional)
 * @param {Function} config.onSuccess - Callback después de guardar exitosamente
 * @param {Object} config.messages - Mensajes personalizados (opcional)
 *
 * @returns {Object} Estado y funciones del formulario
 */
export function useFormModal({
  entity,
  initialFormData,
  onSave,
  validate,
  transformData = (data) => data,
  onSuccess,
  messages = {}
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!entity;

  // Mensajes por defecto
  const defaultMessages = {
    creating: 'Creando...',
    updating: 'Actualizando...',
    created: 'Creado exitosamente',
    updated: 'Actualizado exitosamente',
    error: 'Error al guardar'
  };

  const msgs = { ...defaultMessages, ...messages };

  // Reset form cuando cambia la entidad
  useEffect(() => {
    if (entity) {
      setFormData(entity.fields || entity);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [entity]);

  // Actualizar un campo
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error de ese campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Actualizar múltiples campos
  const updateFields = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  // Guardar
  const handleSave = async () => {
    // 1. Validar
    if (validate) {
      const validation = validate(formData);
      if (!validation.valid) {
        setErrors(validation.errors || {});

        // Mostrar primer error
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          toast.error(firstError);
        }
        return false;
      }
    }

    // 2. Guardar
    setSaving(true);
    try {
      // Transformar datos si es necesario
      const dataToSave = transformData(formData);

      // Llamar a la función de guardado
      await onSave(dataToSave, isEditMode, entity?.id);

      // Mensaje de éxito
      toast.success(isEditMode ? msgs.updated : msgs.created);

      // Callback de éxito
      if (onSuccess) {
        await onSuccess();
      }

      // Reset form
      resetForm();

      return true;
    } catch (err) {
      console.error('Error guardando:', err);
      toast.error(err.message || msgs.error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    handleSave,
    saving,
    errors,
    isEditMode
  };
}
```

#### Paso 2: Refactorizar CategoryModal usando el hook

**Archivo a modificar:** `src/components/modals/categorias/CategoryModal.jsx`

**ANTES (135 líneas):**
```javascript
'use client'
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';

export default function CategoryModal({ show, category, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    categoria: '',
    markup: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoria: category.fields.Categoria || '',
        markup: category.fields.Markup || ''
      });
    } else {
      setFormData({
        categoria: '',
        markup: ''
      });
    }
  }, [category]);

  if (!show) return null;

  const isEditMode = !!category;

  const handleSave = async () => {
    if (!formData.categoria.trim()) {
      toast.error('Por favor ingresá el nombre de la categoría');
      return;
    }

    if (!formData.markup || parseFloat(formData.markup) < 0) {
      toast.error('Por favor ingresá un porcentaje de ganancia válido');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await updateRecord(TABLES.categorias, category.id, {
          Categoria: formData.categoria.trim(),
          Markup: parseFloat(formData.markup)
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createRecord(TABLES.categorias, {
          Categoria: formData.categoria.trim(),
          Markup: parseFloat(formData.markup)
        });
        toast.success('Categoría creada exitosamente');
      }

      await onSaved();
      onClose();
      setFormData({ categoria: '', markup: '' });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        {/* ... resto del JSX ... */}
      </div>
    </div>
  );
}
```

**DESPUÉS (~80 líneas):**
```javascript
'use client'
import React from 'react';
import { useFormModal } from '@/hooks/useFormModal';
import { createRecord, updateRecord } from '@/lib/api/base';
import { TABLES } from '@/lib/nocodb-config';

export default function CategoryModal({ show, category, onClose, onSaved }) {
  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: category,
    initialFormData: {
      categoria: '',
      markup: ''
    },
    validate: (data) => {
      const errors = {};

      if (!data.categoria?.trim()) {
        errors.categoria = 'Por favor ingresá el nombre de la categoría';
      }

      if (!data.markup || parseFloat(data.markup) < 0) {
        errors.markup = 'Por favor ingresá un porcentaje de ganancia válido';
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
        await updateRecord(TABLES.categorias, id, data);
      } else {
        await createRecord(TABLES.categorias, data);
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

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        <p className="py-2 text-sm text-base-content/70">
          {isEditMode ? 'Actualiza los datos de la categoría' : 'Completa los datos de la nueva categoría'}
        </p>

        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre de la Categoría *</span>
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Maderas, Herramientas"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Porcentaje de Ganancia (%) *</span>
            </label>
            <label className="input-group">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.markup}
                onChange={(e) => updateField('markup', e.target.value)}
                className="input input-bordered w-full"
                placeholder="0.00"
              />
              <span>%</span>
            </label>
            <label className="label">
              <span className="label-text-alt">Este porcentaje se aplicará para calcular el precio de venta</span>
            </label>
          </div>
        </div>

        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving && <span className="loading loading-spinner loading-sm"></span>}
            {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Reducción:** 135 líneas → 80 líneas (ahorro de 55 líneas por modal)

#### Paso 3: Refactorizar los 5 modales restantes

Aplicar el mismo patrón a:

1. ✅ `SubcategoryModal.jsx` (150 → 85 líneas, ahorro 65)
2. ✅ `ClienteModal.jsx` (228 → 140 líneas, ahorro 88)
3. ✅ `ProductModal.jsx` (199 → 120 líneas, ahorro 79)
4. ✅ `CostModal.jsx` (181 → 110 líneas, ahorro 71)
5. ✅ `HistoryModal.jsx` (192 → 115 líneas, ahorro 77)

**Ahorro total:**
- 6 modales refactorizados
- Hook reutilizable: +150 líneas
- Ahorro neto: **~735 líneas**

#### Testing

**Crear:** `src/hooks/__tests__/useFormModal.test.js`

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useFormModal } from '../useFormModal';

describe('useFormModal', () => {
  it('should initialize with initial data', () => {
    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: '' },
        onSave: jest.fn()
      })
    );

    expect(result.current.formData).toEqual({ name: '' });
    expect(result.current.isEditMode).toBe(false);
  });

  it('should update field correctly', () => {
    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: '' },
        onSave: jest.fn()
      })
    );

    act(() => {
      result.current.updateField('name', 'Test');
    });

    expect(result.current.formData.name).toBe('Test');
  });

  // ... más tests
});
```

---

### 🎯 Tarea 1.2: Separar Lógica de Cálculos de API

**Prioridad:** 🔴 CRÍTICA
**Esfuerzo:** Bajo (1 día)
**Impacto:** Mejor organización, código más testeable

#### Paso 1: Crear archivo de cálculos

**Archivo a crear:** `src/lib/calculations/presupuestos.js`

```javascript
/**
 * Funciones de cálculo para presupuestos
 * Centralizadas para reutilización y testing
 */

/**
 * Obtiene el markup aplicable según orden de prioridad:
 * 1. Markup del Producto (si existe)
 * 2. Markup de la Subcategoría (si existe y producto no tiene)
 * 3. Markup de la Categoría (si los anteriores no existen)
 *
 * @param {Object} producto - Objeto producto con sus datos
 * @param {Object} subcategoria - Objeto subcategoría (puede ser null)
 * @param {Object} categoria - Objeto categoría (puede ser null)
 * @returns {number} Markup a aplicar (porcentaje)
 */
export const obtenerMarkupAplicable = (producto, subcategoria, categoria) => {
  // Prioridad 1: Markup del producto
  if (producto?.fields?.Markup != null && producto.fields.Markup !== '') {
    const markup = parseFloat(producto.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Prioridad 2: Markup de la subcategoría
  if (subcategoria?.fields?.Markup != null && subcategoria.fields.Markup !== '') {
    const markup = parseFloat(subcategoria.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Prioridad 3: Markup de la categoría
  if (categoria?.fields?.Markup != null && categoria.fields.Markup !== '') {
    const markup = parseFloat(categoria.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Si no hay markup definido, retornar 0
  return 0;
};

/**
 * Calcula el precio de venta de un producto aplicando el markup correspondiente
 *
 * @param {Object} producto - Producto con sus datos
 * @param {Object} subcategoria - Subcategoría del producto
 * @param {Object} categoria - Categoría del producto
 * @param {Object} costoActual - Costo actual del producto
 * @returns {Object} Objeto con costo, markup aplicado, y precio de venta
 */
export const calcularPrecioProducto = (producto, subcategoria, categoria, costoActual) => {
  // Validar que el producto existe
  if (!producto || !producto.id) {
    return {
      costo: 0,
      markup: 0,
      precioVenta: 0,
      moneda: null,
      tieneCosto: false
    };
  }

  // Validar que tiene costo
  if (!costoActual) {
    return {
      costo: 0,
      markup: 0,
      precioVenta: 0,
      moneda: null,
      tieneCosto: false
    };
  }

  const costo = parseFloat(costoActual.fields.Costo);
  const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);
  const precioVenta = costo * (1 + markup / 100);

  return {
    costo,
    markup,
    precioVenta,
    moneda: costoActual.fields.Moneda,
    tieneCosto: true
  };
};

/**
 * Calcula el total de un presupuesto sumando todos sus items
 *
 * @param {Array} items - Array de items del presupuesto
 * @returns {Object} Objeto con subtotal, total y moneda
 */
export const calcularTotalPresupuesto = (items) => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      total: 0,
      moneda: null,
      cantidadItems: 0
    };
  }

  // Asumir que todos los items están en la misma moneda
  const moneda = items[0]?.fields?.Moneda || null;

  const subtotal = items.reduce((sum, item) => {
    const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
    const cantidad = parseFloat(item.fields?.Cantidad) || 0;
    return sum + (precio * cantidad);
  }, 0);

  return {
    subtotal,
    total: subtotal,
    moneda,
    cantidadItems: items.length
  };
};

/**
 * Aplica descuento por efectivo si corresponde
 *
 * @param {number} total - Total del presupuesto
 * @param {boolean} efectivo - Si se paga en efectivo
 * @param {number} descuentoEfectivo - Porcentaje de descuento (default 50% del IVA = 10.5%)
 * @returns {Object} Totales con y sin descuento
 */
export const aplicarDescuentoEfectivo = (total, efectivo, descuentoEfectivo = 10.5) => {
  if (!efectivo) {
    return {
      subtotal: total,
      descuento: 0,
      total: total,
      tieneDescuento: false
    };
  }

  const descuento = total * (descuentoEfectivo / 100);
  const totalConDescuento = total - descuento;

  return {
    subtotal: total,
    descuento,
    total: totalConDescuento,
    tieneDescuento: true,
    porcentajeDescuento: descuentoEfectivo
  };
};
```

#### Paso 2: Actualizar API de presupuestos

**Archivo a modificar:** `src/lib/api/presupuestos.js`

**Eliminar las funciones de cálculo (líneas 189-302) y agregar import:**

```javascript
import { fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from './base';
import { TABLES } from '../nocodb-config';
import { getCostoActual } from './costos';
// ✅ Importar desde calculations
import {
  obtenerMarkupAplicable,
  calcularPrecioProducto,
  calcularTotalPresupuesto
} from '../calculations/presupuestos';

// El resto del archivo permanece igual, solo eliminar las funciones de cálculo
```

#### Paso 3: Actualizar hooks que usan cálculos

**Archivo a modificar:** `src/components/modals/presupuestos/hooks/usePresupuestoItems.js`

```javascript
import {
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto
} from '@/lib/api/index';
// ✅ Importar desde calculations
import { calcularPrecioProducto } from '@/lib/calculations/presupuestos';
import toast from 'react-hot-toast';

// ... resto del código
```

#### Paso 4: Actualizar barrel file

**Archivo a modificar:** `src/lib/api/index.js`

```javascript
// ... exports existentes ...

// ✅ Re-exportar funciones de cálculo
export {
  obtenerMarkupAplicable,
  calcularPrecioProducto,
  calcularTotalPresupuesto,
  aplicarDescuentoEfectivo
} from '../calculations/presupuestos';
```

---

### 🎯 Tarea 1.3: Separar API de Items de Presupuesto

**Prioridad:** 🟡 ALTA
**Esfuerzo:** Bajo (1 día)
**Impacto:** Mejor organización

#### Paso 1: Crear archivo de API de items

**Archivo a crear:** `src/lib/api/presupuestoItems.js`

```javascript
import { fetchRecords, createRecord, updateRecord, deleteRecord } from './base';
import { TABLES } from '../nocodb-config';

/**
 * Obtiene todos los items de presupuesto
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de items
 */
export const getPresupuestoItems = async (options = {}) => {
  return fetchRecords(TABLES.presupuestoItems, options);
};

/**
 * Obtiene los items de un presupuesto específico
 * @param {string} presupuestoId - ID del presupuesto
 * @param {Object} options - Opciones adicionales (nested, fields, etc.)
 * @returns {Promise<Array>} Array de items del presupuesto
 */
export const getItemsByPresupuesto = async (presupuestoId, options = {}) => {
  const where = `(nc_1g29___Presupuestos_id,eq,${presupuestoId})`;

  // Primero obtener los items
  const items = await fetchRecords(TABLES.presupuestoItems, { where, ...options });

  // Si no hay items, retornar array vacío
  if (!items || items.length === 0) {
    return [];
  }

  // Obtener IDs únicos de productos
  const productosIds = [...new Set(items.map(item => item.fields?.nc_1g29__Productos_id).filter(Boolean))];

  if (productosIds.length === 0) {
    return items;
  }

  // Construir filtro para obtener todos los productos en una sola consulta
  const productosWhere = productosIds.map(id => `(Id,eq,${id})`).join('~or');

  // Obtener los productos
  const productos = await fetchRecords(TABLES.productos, {
    where: productosWhere,
    limit: productosIds.length
  });

  // Crear un mapa para acceso rápido
  const productosMap = new Map(productos.map(p => [p.id, p]));

  // Enriquecer items con datos del producto
  const itemsEnriquecidos = items.map(item => {
    const productoId = item.fields?.nc_1g29__Productos_id;
    const producto = productosMap.get(productoId);

    return {
      ...item,
      fields: {
        ...item.fields,
        // Agregar el producto completo en el formato nested
        nc_1g29__Productos_id: producto ? {
          id: producto.id,
          Nombre: producto.fields?.Nombre,
          SKU: producto.fields?.SKU,
          Descripcion: producto.fields?.Descripcion,
          Subcategoria: producto.fields?.Subcategoria,
          Markup: producto.fields?.Markup
        } : item.fields.nc_1g29__Productos_id
      }
    };
  });

  return itemsEnriquecidos;
};

/**
 * Crea un nuevo item de presupuesto
 * @param {Object} itemData - Datos del item
 * @returns {Promise<Object>} Item creado
 */
export const crearPresupuestoItem = async (itemData) => {
  return createRecord(TABLES.presupuestoItems, itemData);
};

/**
 * Actualiza un item de presupuesto existente
 * @param {string} itemId - ID del item
 * @param {Object} itemData - Datos a actualizar
 * @returns {Promise<Object>} Item actualizado
 */
export const actualizarPresupuestoItem = async (itemId, itemData) => {
  return updateRecord(TABLES.presupuestoItems, itemId, itemData);
};

/**
 * Elimina un item de presupuesto
 * @param {string} itemId - ID del item
 * @returns {Promise<void>}
 */
export const eliminarPresupuestoItem = async (itemId) => {
  return deleteRecord(TABLES.presupuestoItems, itemId);
};
```

#### Paso 2: Simplificar presupuestos.js

**Archivo a modificar:** `src/lib/api/presupuestos.js`

Eliminar todo el código de items (líneas 89-188) y mantener solo:

```javascript
import { fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from './base';
import { TABLES } from '../nocodb-config';

/**
 * Cuenta el número total de presupuestos
 */
export const countPresupuestos = async () => {
  return countRecords(TABLES.presupuestos);
};

/**
 * Obtiene todos los presupuestos con información del cliente
 */
export const getPresupuestos = async (options = {}) => {
  const presupuestos = await fetchRecords(TABLES.presupuestos, options);

  // Enriquecer cada presupuesto con los datos completos del cliente
  const presupuestosEnriquecidos = await Promise.all(
    presupuestos.map(async (presupuesto) => {
      const clienteId = presupuesto.fields.nc_1g29__Clientes_id;

      if (clienteId) {
        try {
          const clientes = await fetchRecords(TABLES.clientes, {
            where: `(Id,eq,${clienteId})`,
            limit: 1
          });

          if (clientes.length > 0) {
            presupuesto.fields.ClienteCompleto = clientes[0].fields;
          }
        } catch (error) {
          console.error('Error obteniendo datos del cliente:', error);
        }
      }

      return presupuesto;
    })
  );

  return presupuestosEnriquecidos;
};

/**
 * Obtiene un presupuesto por ID
 */
export const getPresupuestoById = async (presupuestoId) => {
  const presupuestos = await getPresupuestos();
  return presupuestos.find(p => p.id === presupuestoId) || null;
};

/**
 * Crea un nuevo presupuesto
 */
export const crearPresupuesto = async (presupuestoData) => {
  return createRecord(TABLES.presupuestos, presupuestoData);
};

/**
 * Actualiza un presupuesto existente
 */
export const actualizarPresupuesto = async (presupuestoId, presupuestoData) => {
  return updateRecord(TABLES.presupuestos, presupuestoId, presupuestoData);
};

/**
 * Elimina un presupuesto
 */
export const eliminarPresupuesto = async (presupuestoId) => {
  return deleteRecord(TABLES.presupuestos, presupuestoId);
};
```

**Reducción:** 301 líneas → 88 líneas

#### Paso 3: Actualizar barrel file

**Archivo a modificar:** `src/lib/api/index.js`

```javascript
// ... exports existentes ...

// Items de presupuesto
export {
  getPresupuestoItems,
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem
} from './presupuestoItems';
```

---

### ✅ Checklist Fase 1

- [ ] Crear `hooks/useFormModal.js`
- [ ] Refactorizar `CategoryModal.jsx`
- [ ] Refactorizar `SubcategoryModal.jsx`
- [ ] Refactorizar `ClienteModal.jsx`
- [ ] Refactorizar `ProductModal.jsx`
- [ ] Refactorizar `CostModal.jsx`
- [ ] Refactorizar `HistoryModal.jsx`
- [ ] Crear `lib/calculations/presupuestos.js`
- [ ] Actualizar `lib/api/presupuestos.js` (remover cálculos)
- [ ] Crear `lib/api/presupuestoItems.js`
- [ ] Actualizar `lib/api/presupuestos.js` (remover items)
- [ ] Actualizar `lib/api/index.js` (barrel file)
- [ ] Actualizar imports en todos los archivos afectados
- [ ] Probar que todo funciona correctamente

**Resultado esperado Fase 1:**
- ✅ ~735 líneas menos de código duplicado
- ✅ Mejor organización de responsabilidades
- ✅ Código más testeable

---

## Fase 2 - Modularización

**Duración:** 2-3 semanas
**Objetivo:** Dividir componentes grandes y centralizar lógica

---

### 🎯 Tarea 2.1: Dividir Hook `usePresupuestoItems`

**Prioridad:** 🔴 CRÍTICA
**Esfuerzo:** Alto (3-4 días)
**Impacto:** Código más mantenible y testeable

#### Estructura propuesta

```
src/components/modals/presupuestos/hooks/
├── usePresupuestoItems.js          # Hook compuesto (orquestador)
├── usePresupuestoItemsState.js     # Gestión de estado
├── usePresupuestoItemsLoad.js      # Carga de datos
├── usePresupuestoItemsActions.js   # Acciones (agregar, eliminar, actualizar)
└── usePresupuestoItemsSave.js      # Guardar cambios
```

#### Paso 1: Crear hook de estado

**Archivo a crear:** `src/components/modals/presupuestos/hooks/usePresupuestoItemsState.js`

```javascript
import { useState, useRef } from 'react';

/**
 * Maneja el estado de los items del presupuesto
 */
export function usePresupuestoItemsState(presupuesto) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // Si el campo efectivo no existe, usar true como default
  const [efectivo, setEfectivo] = useState(
    presupuesto?.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields.efectivo)
      : true
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    efectivo: null,
    itemsToAdd: [],
    itemsToUpdate: [],
    itemsToDelete: []
  });

  const isInitialMount = useRef(true);

  const resetState = () => {
    const efectivoValue = presupuesto?.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields.efectivo)
      : true;

    setEfectivo(efectivoValue);
    setPendingChanges({
      efectivo: null,
      itemsToAdd: [],
      itemsToUpdate: [],
      itemsToDelete: []
    });
    setHasUnsavedChanges(false);
    isInitialMount.current = true;
  };

  return {
    // Estado
    items,
    setItems,
    loadingItems,
    setLoadingItems,
    saving,
    setSaving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pendingChanges,
    setPendingChanges,
    isInitialMount,
    // Funciones
    resetState
  };
}
```

#### Paso 2: Crear hook de carga

**Archivo a crear:** `src/components/modals/presupuestos/hooks/usePresupuestoItemsLoad.js`

```javascript
import { useEffect } from 'react';
import { getItemsByPresupuesto } from '@/lib/api/index';
import toast from 'react-hot-toast';

/**
 * Maneja la carga de items del presupuesto
 */
export function usePresupuestoItemsLoad(
  presupuesto,
  show,
  setItems,
  setLoadingItems,
  resetState
) {
  // Función de carga
  const cargarItems = async () => {
    if (!presupuesto) return;

    setLoadingItems(true);
    try {
      const itemsData = await getItemsByPresupuesto(presupuesto.id);
      setItems(itemsData);
    } catch (error) {
      console.error('Error cargando items:', error);
      toast.error('Error al cargar los items del presupuesto');
    } finally {
      setLoadingItems(false);
    }
  };

  // Cargar items cuando se abre el modal
  useEffect(() => {
    if (show && presupuesto) {
      cargarItems();
      resetState();
    }
  }, [show, presupuesto]);

  return { cargarItems };
}
```

#### Paso 3: Crear hook de acciones

**Archivo a crear:** `src/components/modals/presupuestos/hooks/usePresupuestoItemsActions.js`

```javascript
import { useCallback } from 'react';
import { calcularPrecioProducto } from '@/lib/calculations/presupuestos';
import toast from 'react-hot-toast';

/**
 * Maneja las acciones sobre los items (agregar, eliminar, actualizar)
 */
export function usePresupuestoItemsActions(
  presupuesto,
  items,
  setItems,
  categorias,
  subcategorias,
  costos,
  setPendingChanges,
  setHasUnsavedChanges
) {
  const agregarItem = useCallback((producto, cantidad) => {
    if (!producto || cantidad <= 0) return false;

    const subcategoria = subcategorias.find(
      s => s.id == producto.fields?.Subcategoria?.id
    );
    const categoria = subcategoria
      ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id)
      : null;

    // Calcular precio con markup
    const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

    if (!precioCalc.tieneCosto) {
      toast.error('Este producto no tiene un costo asignado');
      return false;
    }

    // Crear nuevo item
    const nuevoItem = {
      id: `temp-${Date.now()}`,
      isNew: true,
      fields: {
        nc_1g29___Presupuestos_id: presupuesto.id,
        nc_1g29__Productos_id: {
          id: producto.id,
          Nombre: producto.fields.Nombre,
          SKU: producto.fields.SKU,
          Descripcion: producto.fields.Descripcion,
          Subcategoria: producto.fields.Subcategoria,
          Markup: producto.fields.Markup
        },
        Cantidad: cantidad,
        PrecioUnitario: precioCalc.precioVenta,
        Markup: precioCalc.markup,
        Moneda: precioCalc.moneda
      }
    };

    setItems(prev => [...prev, nuevoItem]);
    setPendingChanges(prev => ({
      ...prev,
      itemsToAdd: [...prev.itemsToAdd, nuevoItem]
    }));
    setHasUnsavedChanges(true);

    return true;
  }, [presupuesto, categorias, subcategorias, costos]);

  const eliminarItem = useCallback((itemId) => {
    const item = items.find(i => i.id === itemId);

    // Si es un item nuevo (temporal), solo lo removemos
    if (item?.isNew) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToAdd: prev.itemsToAdd.filter(i => i.id !== itemId)
      }));
    } else {
      // Si es existente, lo marcamos para eliminar
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToDelete: [...prev.itemsToDelete, itemId]
      }));
    }

    setHasUnsavedChanges(true);
  }, [items]);

  const actualizarCantidad = useCallback((itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;

    // Actualizar items locales
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          fields: {
            ...item.fields,
            Cantidad: nuevaCantidad
          }
        };
      }
      return item;
    }));

    // Agregar a cambios pendientes solo si no es un item nuevo
    const item = items.find(i => i.id === itemId);
    if (!item?.isNew) {
      setPendingChanges(prev => {
        const existingUpdate = prev.itemsToUpdate.find(i => i.id === itemId);
        if (existingUpdate) {
          return {
            ...prev,
            itemsToUpdate: prev.itemsToUpdate.map(i =>
              i.id === itemId ? { id: itemId, Cantidad: nuevaCantidad } : i
            )
          };
        }
        return {
          ...prev,
          itemsToUpdate: [...prev.itemsToUpdate, { id: itemId, Cantidad: nuevaCantidad }]
        };
      });
    }

    setHasUnsavedChanges(true);
  }, [items]);

  return {
    agregarItem,
    eliminarItem,
    actualizarCantidad
  };
}
```

#### Paso 4: Crear hook de guardado

**Archivo a crear:** `src/components/modals/presupuestos/hooks/usePresupuestoItemsSave.js`

```javascript
import {
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto
} from '@/lib/api/index';
import toast from 'react-hot-toast';

/**
 * Maneja el guardado de cambios del presupuesto
 */
export function usePresupuestoItemsSave(
  presupuesto,
  hasUnsavedChanges,
  pendingChanges,
  setPendingChanges,
  setHasUnsavedChanges,
  setSaving,
  cargarItems,
  onSaved
) {
  const guardarCambios = async () => {
    if (!hasUnsavedChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      // 1. Actualizar campo efectivo si cambió
      if (pendingChanges.efectivo !== null) {
        await actualizarPresupuesto(presupuesto.id, {
          efectivo: pendingChanges.efectivo
        });
      }

      // 2. Eliminar items
      for (const itemId of pendingChanges.itemsToDelete) {
        await eliminarPresupuestoItem(itemId);
      }

      // 3. Actualizar items
      for (const item of pendingChanges.itemsToUpdate) {
        await actualizarPresupuestoItem(item.id, {
          Cantidad: item.Cantidad
        });
      }

      // 4. Crear items nuevos
      for (const item of pendingChanges.itemsToAdd) {
        await crearPresupuestoItem({
          nc_1g29___Presupuestos_id: presupuesto.id,
          nc_1g29__Productos_id: item.fields.nc_1g29__Productos_id.id,
          Cantidad: item.fields.Cantidad,
          PrecioUnitario: item.fields.PrecioUnitario,
          Markup: item.fields.Markup,
          Moneda: item.fields.Moneda
        });
      }

      // Reset pending changes y recargar items
      setPendingChanges({
        efectivo: null,
        itemsToAdd: [],
        itemsToUpdate: [],
        itemsToDelete: []
      });
      setHasUnsavedChanges(false);

      // Recargar items para obtener los datos frescos
      await cargarItems();

      toast.success('Cambios guardados correctamente');
      onSaved();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return { guardarCambios };
}
```

#### Paso 5: Hook compuesto (orquestador)

**Archivo a modificar:** `src/components/modals/presupuestos/hooks/usePresupuestoItems.js`

```javascript
import { useEffect } from 'react';
import { usePresupuestoItemsState } from './usePresupuestoItemsState';
import { usePresupuestoItemsLoad } from './usePresupuestoItemsLoad';
import { usePresupuestoItemsActions } from './usePresupuestoItemsActions';
import { usePresupuestoItemsSave } from './usePresupuestoItemsSave';

/**
 * Hook compuesto para manejar la lógica de items de presupuesto
 * Orquesta los diferentes sub-hooks especializados
 */
export function usePresupuestoItems(
  presupuesto,
  show,
  categorias,
  subcategorias,
  costos,
  onSaved
) {
  // 1. Estado
  const {
    items,
    setItems,
    loadingItems,
    setLoadingItems,
    saving,
    setSaving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pendingChanges,
    setPendingChanges,
    isInitialMount,
    resetState
  } = usePresupuestoItemsState(presupuesto);

  // 2. Carga de datos
  const { cargarItems } = usePresupuestoItemsLoad(
    presupuesto,
    show,
    setItems,
    setLoadingItems,
    resetState
  );

  // 3. Acciones
  const { agregarItem, eliminarItem, actualizarCantidad } = usePresupuestoItemsActions(
    presupuesto,
    items,
    setItems,
    categorias,
    subcategorias,
    costos,
    setPendingChanges,
    setHasUnsavedChanges
  );

  // 4. Guardado
  const { guardarCambios } = usePresupuestoItemsSave(
    presupuesto,
    hasUnsavedChanges,
    pendingChanges,
    setPendingChanges,
    setHasUnsavedChanges,
    setSaving,
    cargarItems,
    onSaved
  );

  // 5. Detectar cambio en efectivo
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const efectivoOriginal = presupuesto?.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields.efectivo)
      : true;

    if (presupuesto && efectivo !== efectivoOriginal) {
      setPendingChanges(prev => ({ ...prev, efectivo }));
      setHasUnsavedChanges(true);
    }
  }, [efectivo, presupuesto]);

  return {
    items,
    loadingItems,
    saving,
    efectivo,
    setEfectivo,
    hasUnsavedChanges,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    guardarCambios,
    recargarItems: cargarItems
  };
}
```

**Resultado:**
- 1 archivo de 279 líneas → 5 archivos de ~70 líneas cada uno
- Más fácil de testear (cada hook puede testearse independientemente)
- Más fácil de entender (responsabilidades claras)

---

### 🎯 Tarea 2.2: Extraer Tablas de Páginas

**Prioridad:** 🟡 MEDIA
**Esfuerzo:** Medio (2-3 días)
**Impacto:** Páginas más limpias, componentes reutilizables

#### Paso 1: Crear componente PresupuestosTable

**Archivo a crear:** `src/components/tables/PresupuestosTable.jsx`

```javascript
'use client'
import { formatDate, formatCurrency } from '@/lib/utils';
import { FileText, Edit2, Trash2, DollarSign } from 'lucide-react';

export default function PresupuestosTable({
  presupuestos,
  onEdit,
  onDelete,
  onOpenItems,
  onDownloadPDF,
  loading = false
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (presupuestos.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/60">
        No hay presupuestos para mostrar
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Título</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Forma de Pago</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {presupuestos.map((presupuesto) => (
            <tr key={presupuesto.id}>
              <td>{formatDate(presupuesto.fields.Fecha)}</td>
              <td className="font-semibold">{presupuesto.fields.Titulo}</td>
              <td>{presupuesto.fields.ClienteCompleto?.Nombre || '-'}</td>
              <td>
                <span className={`badge ${
                  presupuesto.fields.Estado === 'Aprobado' ? 'badge-success' :
                  presupuesto.fields.Estado === 'Pendiente' ? 'badge-warning' :
                  'badge-error'
                }`}>
                  {presupuesto.fields.Estado}
                </span>
              </td>
              <td>
                {presupuesto.fields.efectivo ? (
                  <span className="badge badge-success">Efectivo</span>
                ) : (
                  <span className="badge badge-info">Transferencia</span>
                )}
              </td>
              <td className="font-semibold">
                {formatCurrency(presupuesto.fields.Total || 0)}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenItems(presupuesto)}
                    className="btn btn-sm btn-ghost"
                    title="Gestionar Items"
                  >
                    <DollarSign size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(presupuesto)}
                    className="btn btn-sm btn-ghost"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDownloadPDF(presupuesto)}
                    className="btn btn-sm btn-ghost"
                    title="Descargar PDF"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(presupuesto.id)}
                    className="btn btn-sm btn-ghost text-error"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Paso 2: Simplificar la página

**Archivo a modificar:** `src/app/(protected)/presupuestos/page.jsx`

**ANTES (303 líneas):**
```javascript
export default function PresupuestosPage() {
  // ... 50 líneas de estado y hooks ...

  // ... 100 líneas de funciones ...

  return (
    <div>
      {/* 150 líneas de JSX con tabla inline */}
    </div>
  )
}
```

**DESPUÉS (~150 líneas):**
```javascript
'use client'
import { useState, useEffect } from 'react';
import { usePagination, useCatalog } from '@/hooks';
import {
  getPresupuestos,
  countPresupuestos,
  eliminarPresupuesto
} from '@/lib/api';
import PresupuestosTable from '@/components/tables/PresupuestosTable';
import PresupuestoModal from '@/components/modals/presupuestos/PresupuestoModal';
import PresupuestoItemsModal from '@/components/modals/presupuestos/PresupuestoItemsModal';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import toast from 'react-hot-toast';

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const { currentPage, itemsPerPage, goToPage, totalPages } = usePagination(totalCount);
  const { categorias, subcategorias, costos } = useCatalog();

  // Cargar presupuestos
  const cargarPresupuestos = async () => {
    setLoading(true);
    try {
      const [data, count] = await Promise.all([
        getPresupuestos({
          offset: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage
        }),
        countPresupuestos()
      ]);

      setPresupuestos(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error cargando presupuestos:', error);
      toast.error('Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, [currentPage]);

  // Handlers
  const handleEdit = (presupuesto) => {
    setEditingPresupuesto(presupuesto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;

    try {
      await eliminarPresupuesto(id);
      toast.success('Presupuesto eliminado');
      cargarPresupuestos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el presupuesto');
    }
  };

  const openItemsModal = (presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setShowItemsModal(true);
  };

  const downloadPDF = async (presupuesto) => {
    // ... lógica de PDF ...
  };

  // Filtrado
  const filteredPresupuestos = presupuestos.filter(p =>
    p.fields.Titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.fields.ClienteCompleto?.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <button
          onClick={() => {
            setEditingPresupuesto(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          Nuevo Presupuesto
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por título o cliente..."
      />

      <PresupuestosTable
        presupuestos={filteredPresupuestos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenItems={openItemsModal}
        onDownloadPDF={downloadPDF}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {showModal && (
        <PresupuestoModal
          show={showModal}
          presupuesto={editingPresupuesto}
          onClose={() => {
            setShowModal(false);
            setEditingPresupuesto(null);
          }}
          onSaved={cargarPresupuestos}
        />
      )}

      {showItemsModal && (
        <PresupuestoItemsModal
          show={showItemsModal}
          presupuesto={selectedPresupuesto}
          categorias={categorias}
          subcategorias={subcategorias}
          costos={costos}
          onClose={() => {
            setShowItemsModal(false);
            setSelectedPresupuesto(null);
          }}
          onSaved={cargarPresupuestos}
        />
      )}
    </div>
  );
}
```

**Reducción:** 303 → ~150 líneas

#### Paso 3: Repetir para otras páginas

Crear tablas para:
- `ProductosTable.jsx`
- `ClientesTable.jsx`
- `CategoriasTable.jsx`

---

### 🎯 Tarea 2.3: Centralizar Validaciones

**Prioridad:** 🟡 MEDIA
**Esfuerzo:** Bajo (1 día)
**Impacto:** Validaciones consistentes

#### Paso 1: Expandir archivo de validaciones

**Archivo a modificar:** `src/lib/utils/validation.js`

```javascript
/**
 * Funciones de validación centralizadas
 */

// ===== Validadores básicos =====

export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validarCUIT = (cuit) => {
  const cuitRegex = /^\d{2}-\d{8}-\d$/;
  return cuitRegex.test(cuit);
};

export const validarTelefono = (telefono) => {
  const telefonoRegex = /^\+?\d{10,15}$/;
  return telefonoRegex.test(telefono.replace(/\s/g, ''));
};

// ===== Esquemas de validación =====

export const validationSchemas = {
  categoria: {
    validate: (data) => {
      const errors = {};

      if (!data.categoria?.trim()) {
        errors.categoria = 'El nombre de la categoría es requerido';
      }

      if (!data.markup || parseFloat(data.markup) < 0) {
        errors.markup = 'Ingresá un porcentaje de ganancia válido';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  },

  subcategoria: {
    validate: (data) => {
      const errors = {};

      if (!data.subcategoria?.trim()) {
        errors.subcategoria = 'El nombre de la subcategoría es requerido';
      }

      if (!data.nc_1g29__Categorias_id) {
        errors.nc_1g29__Categorias_id = 'Seleccioná una categoría';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  },

  cliente: {
    validate: (data) => {
      const errors = {};

      if (!data.Nombre?.trim()) {
        errors.Nombre = 'El nombre es requerido';
      }

      if (data.CUIT && !validarCUIT(data.CUIT)) {
        errors.CUIT = 'Formato de CUIT inválido (XX-XXXXXXXX-X)';
      }

      if (data.Email && !validarEmail(data.Email)) {
        errors.Email = 'Formato de email inválido';
      }

      if (data.Tel && !validarTelefono(data.Tel)) {
        errors.Tel = 'Formato de teléfono inválido';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  },

  producto: {
    validate: (data) => {
      const errors = {};

      if (!data.Nombre?.trim()) {
        errors.Nombre = 'El nombre del producto es requerido';
      }

      if (!data.SKU?.trim()) {
        errors.SKU = 'El SKU es requerido';
      }

      if (!data.Subcategoria) {
        errors.Subcategoria = 'Seleccioná una subcategoría';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  },

  presupuesto: {
    validate: (data) => {
      const errors = {};

      if (!data.Titulo?.trim()) {
        errors.Titulo = 'El título es requerido';
      }

      if (!data.nc_1g29__Clientes_id) {
        errors.nc_1g29__Clientes_id = 'Seleccioná un cliente';
      }

      if (!data.Fecha) {
        errors.Fecha = 'La fecha es requerida';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  }
};

// ===== Helper para usar en useFormModal =====

export const getValidator = (entityType) => {
  return validationSchemas[entityType]?.validate;
};
```

#### Paso 2: Usar en useFormModal

Ahora los modales pueden hacer:

```javascript
import { getValidator } from '@/lib/utils/validation';

const { formData, handleSave, ... } = useFormModal({
  entity: categoria,
  initialFormData: { ... },
  validate: getValidator('categoria'), // ✅ Validación centralizada
  onSave: ...
});
```

---

### 🎯 Tarea 2.4: Hook useToast Centralizado

**Prioridad:** 🟢 BAJA
**Esfuerzo:** Bajo (1 día)
**Impacto:** Mensajes consistentes

#### Crear hook de toast

**Archivo a crear:** `src/hooks/useToast.js`

```javascript
import toast from 'react-hot-toast';

/**
 * Hook para mensajes de toast estandarizados
 */
export function useToast() {
  // Mensajes de éxito
  const success = {
    created: (entity) => toast.success(`${entity} creado exitosamente`),
    updated: (entity) => toast.success(`${entity} actualizado exitosamente`),
    deleted: (entity) => toast.success(`${entity} eliminado exitosamente`),
    saved: () => toast.success('Cambios guardados correctamente'),
    custom: (message) => toast.success(message)
  };

  // Mensajes de error
  const error = {
    loading: (entity) => toast.error(`Error al cargar ${entity}`),
    saving: (entity) => toast.error(`Error al guardar ${entity}`),
    deleting: (entity) => toast.error(`Error al eliminar ${entity}`),
    required: (field) => toast.error(`El campo ${field} es requerido`),
    invalid: (field) => toast.error(`El campo ${field} es inválido`),
    custom: (message) => toast.error(message)
  };

  // Mensajes de información
  const info = {
    noChanges: () => toast.info('No hay cambios para guardar'),
    custom: (message) => toast.info(message)
  };

  // Mensajes de advertencia
  const warning = {
    unsavedChanges: () => toast.warning('Hay cambios sin guardar'),
    custom: (message) => toast.warning(message)
  };

  return {
    success,
    error,
    info,
    warning
  };
}
```

**Uso:**

```javascript
const toast = useToast();

// En lugar de:
toast.success('Categoría creada exitosamente');

// Usar:
toast.success.created('Categoría');
```

---

### ✅ Checklist Fase 2

- [ ] Crear `usePresupuestoItemsState.js`
- [ ] Crear `usePresupuestoItemsLoad.js`
- [ ] Crear `usePresupuestoItemsActions.js`
- [ ] Crear `usePresupuestoItemsSave.js`
- [ ] Refactorizar `usePresupuestoItems.js` (hook compuesto)
- [ ] Crear `PresupuestosTable.jsx`
- [ ] Crear `ProductosTable.jsx`
- [ ] Crear `ClientesTable.jsx`
- [ ] Crear `CategoriasTable.jsx`
- [ ] Simplificar `presupuestos/page.jsx`
- [ ] Simplificar `productos/page.jsx`
- [ ] Simplificar `clientes/page.jsx`
- [ ] Simplificar `categorias/page.jsx`
- [ ] Expandir `validation.js` con esquemas
- [ ] Crear `hooks/useToast.js`
- [ ] Actualizar modales para usar validaciones centralizadas

**Resultado esperado Fase 2:**
- ✅ Hooks más pequeños y testeables
- ✅ Páginas de ~150 líneas (50% reducción)
- ✅ Validaciones consistentes

---

## Fase 3 - Calidad y Escalabilidad

**Duración:** 3-4 semanas
**Objetivo:** Tests, documentación y mejoras de largo plazo

---

### 🎯 Tarea 3.1: Agregar JSDoc Completo

**Prioridad:** 🟢 BAJA
**Esfuerzo:** Medio (3-4 días)
**Impacto:** Mejor DX (Developer Experience)

#### Crear archivo de tipos

**Archivo a crear:** `src/types/index.js`

```javascript
/**
 * @typedef {Object} Categoria
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.Categoria
 * @property {number} fields.Markup
 */

/**
 * @typedef {Object} Subcategoria
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.Subcategoria
 * @property {number} [fields.Markup]
 * @property {string} fields.nc_1g29__Categorias_id
 */

/**
 * @typedef {Object} Cliente
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.Nombre
 * @property {string} [fields.CUIT]
 * @property {string} [fields.CondicionIVA]
 * @property {string} [fields.Email]
 * @property {string} [fields.Tel]
 * @property {string} [fields.Dirección]
 */

/**
 * @typedef {Object} Producto
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.Nombre
 * @property {string} fields.SKU
 * @property {string} [fields.Descripcion]
 * @property {Object} fields.Subcategoria
 * @property {number} [fields.Markup]
 */

/**
 * @typedef {Object} Presupuesto
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.Titulo
 * @property {string} fields.Fecha
 * @property {string} fields.nc_1g29__Clientes_id
 * @property {Object} [fields.ClienteCompleto]
 * @property {string} fields.Estado
 * @property {boolean} fields.efectivo
 * @property {number} [fields.Total]
 */

/**
 * @typedef {Object} PresupuestoItem
 * @property {string} id
 * @property {Object} fields
 * @property {string} fields.nc_1g29___Presupuestos_id
 * @property {Object} fields.nc_1g29__Productos_id
 * @property {number} fields.Cantidad
 * @property {number} fields.PrecioUnitario
 * @property {number} fields.Markup
 * @property {string} fields.Moneda
 */

// ... más tipos ...
```

#### Agregar JSDoc a funciones

**Ejemplo en API:**

```javascript
/**
 * Obtiene todos los presupuestos con información del cliente
 *
 * @param {Object} [options={}] - Opciones de paginación y filtrado
 * @param {number} [options.offset] - Offset para paginación
 * @param {number} [options.limit] - Límite de resultados
 * @param {string} [options.where] - Filtro where de NocoDB
 * @returns {Promise<Presupuesto[]>} Array de presupuestos
 * @throws {Error} Si falla la petición a la API
 */
export const getPresupuestos = async (options = {}) => {
  // ...
};
```

---

### 🎯 Tarea 3.2: Tests Unitarios

**Prioridad:** 🟡 MEDIA
**Esfuerzo:** Alto (5-7 días)
**Impacto:** Confianza en refactorizaciones futuras

#### Configurar Jest y Testing Library

**Instalar dependencias:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/react-hooks jest-environment-jsdom
```

**Crear:** `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Crear:** `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
```

#### Tests para hooks

**Crear:** `src/hooks/__tests__/useFormModal.test.js`

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useFormModal } from '../useFormModal';

describe('useFormModal', () => {
  const mockOnSave = jest.fn().mockResolvedValue(true);
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializar con datos iniciales', () => {
    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: '', age: 0 },
        onSave: mockOnSave
      })
    );

    expect(result.current.formData).toEqual({ name: '', age: 0 });
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.saving).toBe(false);
  });

  it('debe actualizar un campo correctamente', () => {
    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: '' },
        onSave: mockOnSave
      })
    );

    act(() => {
      result.current.updateField('name', 'Test');
    });

    expect(result.current.formData.name).toBe('Test');
  });

  it('debe validar antes de guardar', async () => {
    const mockValidate = jest.fn().mockReturnValue({
      valid: false,
      errors: { name: 'Requerido' }
    });

    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: '' },
        onSave: mockOnSave,
        validate: mockValidate
      })
    );

    await act(async () => {
      const success = await result.current.handleSave();
      expect(success).toBe(false);
    });

    expect(mockValidate).toHaveBeenCalledWith({ name: '' });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('debe guardar correctamente si la validación pasa', async () => {
    const mockValidate = jest.fn().mockReturnValue({
      valid: true,
      errors: {}
    });

    const { result } = renderHook(() =>
      useFormModal({
        entity: null,
        initialFormData: { name: 'Test' },
        onSave: mockOnSave,
        validate: mockValidate,
        onSuccess: mockOnSuccess
      })
    );

    await act(async () => {
      const success = await result.current.handleSave();
      expect(success).toBe(true);
    });

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
```

#### Tests para cálculos

**Crear:** `src/lib/calculations/__tests__/presupuestos.test.js`

```javascript
import {
  obtenerMarkupAplicable,
  calcularPrecioProducto,
  calcularTotalPresupuesto,
  aplicarDescuentoEfectivo
} from '../presupuestos';

describe('obtenerMarkupAplicable', () => {
  it('debe retornar markup del producto si existe', () => {
    const producto = { fields: { Markup: 50 } };
    const subcategoria = { fields: { Markup: 30 } };
    const categoria = { fields: { Markup: 20 } };

    const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);

    expect(markup).toBe(50);
  });

  it('debe retornar markup de subcategoría si producto no tiene', () => {
    const producto = { fields: {} };
    const subcategoria = { fields: { Markup: 30 } };
    const categoria = { fields: { Markup: 20 } };

    const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);

    expect(markup).toBe(30);
  });

  it('debe retornar markup de categoría si los anteriores no existen', () => {
    const producto = { fields: {} };
    const subcategoria = { fields: {} };
    const categoria = { fields: { Markup: 20 } };

    const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);

    expect(markup).toBe(20);
  });

  it('debe retornar 0 si ninguno tiene markup', () => {
    const producto = { fields: {} };
    const subcategoria = { fields: {} };
    const categoria = { fields: {} };

    const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);

    expect(markup).toBe(0);
  });
});

describe('calcularPrecioProducto', () => {
  it('debe calcular correctamente el precio de venta', () => {
    const producto = { id: '1', fields: { Markup: 50 } };
    const costoActual = { fields: { Costo: 100, Moneda: 'USD' } };

    const resultado = calcularPrecioProducto(producto, null, null, costoActual);

    expect(resultado).toEqual({
      costo: 100,
      markup: 50,
      precioVenta: 150,
      moneda: 'USD',
      tieneCosto: true
    });
  });

  it('debe retornar objeto vacío si no tiene costo', () => {
    const producto = { id: '1', fields: {} };
    const costoActual = null;

    const resultado = calcularPrecioProducto(producto, null, null, costoActual);

    expect(resultado.tieneCosto).toBe(false);
    expect(resultado.precioVenta).toBe(0);
  });
});

describe('calcularTotalPresupuesto', () => {
  it('debe calcular el total correctamente', () => {
    const items = [
      { fields: { PrecioUnitario: 100, Cantidad: 2, Moneda: 'USD' } },
      { fields: { PrecioUnitario: 50, Cantidad: 3, Moneda: 'USD' } }
    ];

    const resultado = calcularTotalPresupuesto(items);

    expect(resultado).toEqual({
      subtotal: 350,
      total: 350,
      moneda: 'USD',
      cantidadItems: 2
    });
  });

  it('debe retornar 0 si no hay items', () => {
    const resultado = calcularTotalPresupuesto([]);

    expect(resultado.total).toBe(0);
    expect(resultado.cantidadItems).toBe(0);
  });
});

describe('aplicarDescuentoEfectivo', () => {
  it('debe aplicar descuento si es efectivo', () => {
    const resultado = aplicarDescuentoEfectivo(1000, true, 10);

    expect(resultado).toEqual({
      subtotal: 1000,
      descuento: 100,
      total: 900,
      tieneDescuento: true,
      porcentajeDescuento: 10
    });
  });

  it('no debe aplicar descuento si no es efectivo', () => {
    const resultado = aplicarDescuentoEfectivo(1000, false);

    expect(resultado).toEqual({
      subtotal: 1000,
      descuento: 0,
      total: 1000,
      tieneDescuento: false
    });
  });
});
```

#### Agregar scripts de test

**Modificar:** `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### 🎯 Tarea 3.3: Documentación

**Prioridad:** 🟢 BAJA
**Esfuerzo:** Medio (2-3 días)
**Impacto:** Onboarding más rápido

#### Crear README principal

**Archivo a crear:** `README.md`

```markdown
# Forestal App

Sistema de gestión de presupuestos para empresa forestal.

## Tecnologías

- **Frontend:** Next.js 13+ (App Router), React, TailwindCSS, DaisyUI
- **Backend:** NocoDB (API REST)
- **Autenticación:** NextAuth.js
- **PDF:** React-PDF
- **Testing:** Jest, React Testing Library

## Estructura del Proyecto

Ver [ESTRUCTURA.md](./docs/ESTRUCTURA.md) para detalles completos.

```
src/
├── app/                    # Next.js App Router (páginas y API routes)
├── components/             # Componentes React reutilizables
│   ├── modals/            # Modales CRUD por entidad
│   ├── tables/            # Tablas reutilizables
│   └── ...
├── hooks/                  # Hooks personalizados
├── lib/                    # Lógica de negocio
│   ├── api/               # Capa de acceso a datos
│   ├── calculations/      # Lógica de cálculo
│   └── utils/             # Utilidades generales
├── context/                # Contextos React
└── types/                  # Definiciones JSDoc
```

## Inicio Rápido

### Prerequisitos

- Node.js 18+
- npm o yarn
- Cuenta de NocoDB configurada

### Instalación

```bash
# Clonar repositorio
git clone ...

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```env
# NocoDB
NEXT_PUBLIC_NOCODB_API_URL=https://tu-instancia.nocodb.com
NEXT_PUBLIC_NOCODB_API_TOKEN=tu-token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-generado
```

## Guías

- [Agregar una nueva entidad](./docs/AGREGAR_ENTIDAD.md)
- [Cómo funcionan los modales](./docs/MODALES.md)
- [Sistema de cálculos](./docs/CALCULOS.md)
- [Testing](./docs/TESTING.md)

## Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Producción
npm run lint         # ESLint
npm run test         # Tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Coverage de tests
```

## Arquitectura

### Flujo de Datos

```
Usuario → Página → Modal → useFormModal → API Layer → NocoDB
                                          ↓
                              Calculations (si aplica)
```

### Patrón de Modales CRUD

Todos los modales siguen el patrón:

1. Usar `useFormModal` hook genérico
2. Validación con esquemas centralizados
3. Guardado con funciones de API layer
4. Mensajes con `useToast`

Ver ejemplo completo en [docs/MODALES.md](./docs/MODALES.md)

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Coverage objetivo: 60%+

## Convenciones de Código

- **Nombres de archivos:** PascalCase para componentes, camelCase para utils/hooks
- **Imports:** Usar alias `@/` para imports absolutos
- **Comentarios:** JSDoc para funciones exportadas
- **Tests:** Colocar en `__tests__/` junto al archivo

## Contribuir

1. Crear branch desde `main`
2. Hacer cambios
3. Asegurar que tests pasan (`npm run test`)
4. Crear PR

## License

Privado - Uso interno solamente
```

#### Crear guía de agregar entidad

**Archivo a crear:** `docs/AGREGAR_ENTIDAD.md`

```markdown
# Cómo Agregar una Nueva Entidad

Esta guía te muestra cómo agregar una nueva entidad (ej: Proveedores) al sistema.

## Pasos

### 1. Crear tabla en NocoDB

1. Acceder a NocoDB
2. Crear nueva tabla (ej: `Proveedores`)
3. Definir campos
4. Obtener el table ID

### 2. Actualizar configuración

**Archivo:** `src/lib/nocodb-config.js`

```javascript
export const TABLES = {
  // ... tablas existentes ...
  proveedores: 'table_id_aqui'
};
```

### 3. Crear función de API

**Archivo:** `src/lib/api/proveedores.js`

```javascript
import { fetchRecords, createRecord, updateRecord, deleteRecord } from './base';
import { TABLES } from '../nocodb-config';

export const getProveedores = async (options = {}) => {
  return fetchRecords(TABLES.proveedores, options);
};

export const crearProveedor = async (data) => {
  return createRecord(TABLES.proveedores, data);
};

export const actualizarProveedor = async (id, data) => {
  return updateRecord(TABLES.proveedores, id, data);
};

export const eliminarProveedor = async (id) => {
  return deleteRecord(TABLES.proveedores, id);
};
```

### 4. Actualizar barrel file

**Archivo:** `src/lib/api/index.js`

```javascript
// ... exports existentes ...
export * from './proveedores';
```

### 5. Crear esquema de validación

**Archivo:** `src/lib/utils/validation.js`

```javascript
export const validationSchemas = {
  // ... esquemas existentes ...
  proveedor: {
    validate: (data) => {
      const errors = {};

      if (!data.Nombre?.trim()) {
        errors.Nombre = 'El nombre es requerido';
      }

      // ... más validaciones ...

      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    }
  }
};
```

### 6. Crear modal

**Archivo:** `src/components/modals/proveedores/ProveedorModal.jsx`

```javascript
'use client'
import { useFormModal } from '@/hooks/useFormModal';
import { crearProveedor, actualizarProveedor } from '@/lib/api';
import { getValidator } from '@/lib/utils/validation';

export default function ProveedorModal({ show, proveedor, onClose, onSaved }) {
  const {
    formData,
    updateField,
    handleSave,
    saving,
    isEditMode
  } = useFormModal({
    entity: proveedor,
    initialFormData: {
      Nombre: '',
      // ... más campos ...
    },
    validate: getValidator('proveedor'),
    onSave: async (data, isEdit, id) => {
      if (isEdit) {
        await actualizarProveedor(id, data);
      } else {
        await crearProveedor(data);
      }
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    messages: {
      created: 'Proveedor creado exitosamente',
      updated: 'Proveedor actualizado exitosamente',
      error: 'Error al guardar el proveedor'
    }
  });

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h3>

        <div className="py-4 space-y-4">
          {/* Campos del formulario */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre *</span>
            </label>
            <input
              type="text"
              value={formData.Nombre}
              onChange={(e) => updateField('Nombre', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* ... más campos ... */}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost" disabled={saving}>
            Cancelar
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving && <span className="loading loading-spinner loading-sm"></span>}
            {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. Crear tabla

**Archivo:** `src/components/tables/ProveedoresTable.jsx`

```javascript
'use client'
import { Edit2, Trash2 } from 'lucide-react';

export default function ProveedoresTable({
  proveedores,
  onEdit,
  onDelete,
  loading = false
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            {/* ... más columnas ... */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id}>
              <td>{proveedor.fields.Nombre}</td>
              {/* ... más celdas ... */}
              <td>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(proveedor)} className="btn btn-sm btn-ghost">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(proveedor.id)} className="btn btn-sm btn-ghost text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8. Crear página

**Archivo:** `src/app/(protected)/proveedores/page.jsx`

```javascript
'use client'
import { useState, useEffect } from 'react';
import { usePagination } from '@/hooks';
import { getProveedores, eliminarProveedor } from '@/lib/api';
import ProveedoresTable from '@/components/tables/ProveedoresTable';
import ProveedorModal from '@/components/modals/proveedores/ProveedorModal';
import toast from 'react-hot-toast';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar proveedor?')) return;

    try {
      await eliminarProveedor(id);
      toast.success('Proveedor eliminado');
      cargar();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary">
          Nuevo Proveedor
        </button>
      </div>

      <ProveedoresTable
        proveedores={proveedores}
        onEdit={(p) => { setEditing(p); setShowModal(true); }}
        onDelete={handleDelete}
        loading={loading}
      />

      {showModal && (
        <ProveedorModal
          show={showModal}
          proveedor={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={cargar}
        />
      )}
    </div>
  );
}
```

### 9. Agregar ruta al Sidebar

**Archivo:** `src/components/Sidebar.jsx`

```javascript
// Agregar en el array de links:
{ href: '/proveedores', icon: Building, label: 'Proveedores' }
```

### 10. Tests (opcional pero recomendado)

**Archivo:** `src/lib/api/__tests__/proveedores.test.js`

```javascript
import { getProveedores, crearProveedor } from '../proveedores';
import { fetchRecords, createRecord } from '../base';

jest.mock('../base');

describe('API Proveedores', () => {
  it('debe obtener proveedores', async () => {
    fetchRecords.mockResolvedValue([{ id: '1', fields: { Nombre: 'Test' } }]);

    const result = await getProveedores();

    expect(result).toHaveLength(1);
    expect(fetchRecords).toHaveBeenCalledWith(expect.any(String), {});
  });
});
```

## Checklist

- [ ] Tabla creada en NocoDB
- [ ] Table ID agregado a `nocodb-config.js`
- [ ] Funciones de API creadas
- [ ] Barrel file actualizado
- [ ] Esquema de validación creado
- [ ] Modal creado
- [ ] Tabla creada
- [ ] Página creada
- [ ] Ruta agregada al sidebar
- [ ] Tests creados (opcional)
- [ ] Todo funciona correctamente

## Tiempo estimado

**Total:** 2-3 horas para una entidad simple

- Configuración: 15 min
- API: 15 min
- Validación: 15 min
- Modal: 30 min
- Tabla: 30 min
- Página: 30 min
- Tests: 30 min (opcional)
```

---

### ✅ Checklist Fase 3

- [ ] Crear `types/index.js` con JSDoc
- [ ] Agregar JSDoc a todas las funciones de API
- [ ] Agregar JSDoc a todos los hooks
- [ ] Configurar Jest
- [ ] Tests para `useFormModal`
- [ ] Tests para `lib/calculations/presupuestos.js`
- [ ] Tests para validaciones
- [ ] Tests para funciones de API
- [ ] Crear `README.md` principal
- [ ] Crear `docs/ESTRUCTURA.md`
- [ ] Crear `docs/AGREGAR_ENTIDAD.md`
- [ ] Crear `docs/MODALES.md`
- [ ] Crear `docs/CALCULOS.md`
- [ ] Crear `docs/TESTING.md`

**Resultado esperado Fase 3:**
- ✅ Documentación completa
- ✅ 60%+ test coverage
- ✅ Tipos con JSDoc

---

## Estructura Final Propuesta

```
forestal-app/
├── docs/                               # 🆕 Documentación
│   ├── AGREGAR_ENTIDAD.md
│   ├── ESTRUCTURA.md
│   ├── MODALES.md
│   ├── CALCULOS.md
│   └── TESTING.md
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (protected)/
│   │   │   ├── categorias/
│   │   │   │   └── page.jsx           # ✅ ~100 líneas (era 202)
│   │   │   ├── clientes/
│   │   │   │   └── page.jsx           # ✅ ~100 líneas (era 193)
│   │   │   ├── productos/
│   │   │   │   └── page.jsx           # ✅ ~140 líneas (era 276)
│   │   │   ├── presupuestos/
│   │   │   │   └── page.jsx           # ✅ ~150 líneas (era 303)
│   │   │   └── ...
│   │   └── api/
│   │
│   ├── components/
│   │   ├── modals/
│   │   │   ├── categorias/
│   │   │   │   ├── CategoryModal.jsx          # ✅ ~80 líneas (era 135)
│   │   │   │   └── SubcategoryModal.jsx       # ✅ ~85 líneas (era 150)
│   │   │   ├── clientes/
│   │   │   │   └── ClienteModal.jsx           # ✅ ~140 líneas (era 228)
│   │   │   ├── presupuestos/
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   │       ├── usePresupuestoItems.js            # ✅ ~70 líneas (era 279)
│   │   │   │       ├── usePresupuestoItemsState.js       # 🆕 ~60 líneas
│   │   │   │       ├── usePresupuestoItemsLoad.js        # 🆕 ~50 líneas
│   │   │   │       ├── usePresupuestoItemsActions.js     # 🆕 ~80 líneas
│   │   │   │       └── usePresupuestoItemsSave.js        # 🆕 ~60 líneas
│   │   │   └── productos/
│   │   │       ├── ProductModal.jsx           # ✅ ~120 líneas (era 199)
│   │   │       ├── CostModal.jsx              # ✅ ~110 líneas (era 181)
│   │   │       └── HistoryModal.jsx           # ✅ ~115 líneas (era 192)
│   │   │
│   │   ├── tables/                     # 🆕 Componentes de tabla
│   │   │   ├── PresupuestosTable.jsx
│   │   │   ├── ProductosTable.jsx
│   │   │   ├── ClientesTable.jsx
│   │   │   └── CategoriasTable.jsx
│   │   │
│   │   ├── Pagination.jsx              # 🆕 Componente reutilizable
│   │   ├── SearchBar.jsx               # 🆕 Componente reutilizable
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── __tests__/                  # 🆕 Tests
│   │   │   ├── useFormModal.test.js
│   │   │   └── usePagination.test.js
│   │   ├── useNocoDB.js
│   │   ├── usePagination.js
│   │   ├── useFormModal.js             # 🆕 Hook genérico de modales
│   │   └── useToast.js                 # 🆕 Hook de toasts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── __tests__/              # 🆕 Tests
│   │   │   ├── base.js
│   │   │   ├── presupuestos.js         # ✅ ~90 líneas (era 301)
│   │   │   ├── presupuestoItems.js     # 🆕 ~100 líneas
│   │   │   ├── productos.js
│   │   │   ├── clientes.js
│   │   │   └── index.js
│   │   │
│   │   ├── calculations/               # 🆕 Lógica de cálculo
│   │   │   ├── __tests__/
│   │   │   │   └── presupuestos.test.js
│   │   │   ├── presupuestos.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/
│   │   │   ├── __tests__/              # 🆕 Tests
│   │   │   ├── constants.js
│   │   │   ├── formatting.js
│   │   │   ├── validation.js           # ✅ Expandido con esquemas
│   │   │   └── index.js
│   │   │
│   │   └── ...
│   │
│   ├── types/                          # 🆕 Definiciones JSDoc
│   │   └── index.js
│   │
│   └── ...
│
├── ANALISIS.md                         # 🆕 Análisis técnico
├── PLAN_REFACTORIZACION.md             # 🆕 Este documento
├── README.md                           # 🆕 Documentación principal
├── jest.config.js                      # 🆕 Configuración de Jest
├── jest.setup.js                       # 🆕 Setup de Jest
└── package.json
```

---

## Checklist de Implementación

### Fase 1 - Impacto Rápido ✅

**Semana 1:**
- [ ] Día 1-2: Crear `useFormModal` hook
- [ ] Día 2-3: Refactorizar 6 modales
- [ ] Día 4: Crear `lib/calculations/presupuestos.js`
- [ ] Día 5: Separar `presupuestoItems.js` de API

**Semana 2:**
- [ ] Testing de cambios Fase 1
- [ ] Corrección de bugs
- [ ] Documentación de cambios

### Fase 2 - Modularización ✅

**Semana 3:**
- [ ] Día 1-2: Dividir `usePresupuestoItems` en 5 hooks
- [ ] Día 3-4: Crear tablas reutilizables
- [ ] Día 5: Simplificar páginas

**Semana 4:**
- [ ] Día 1: Expandir validaciones
- [ ] Día 2: Crear `useToast` hook
- [ ] Día 3-5: Testing de cambios Fase 2

**Semana 5:**
- [ ] Corrección de bugs
- [ ] Optimizaciones

### Fase 3 - Calidad ✅

**Semana 6:**
- [ ] Día 1-2: Agregar JSDoc completo
- [ ] Día 3-5: Configurar Jest y primeros tests

**Semana 7:**
- [ ] Día 1-3: Tests de hooks y calculations
- [ ] Día 4-5: Tests de validaciones y API

**Semana 8:**
- [ ] Día 1-2: Crear README y documentación
- [ ] Día 3-4: Crear guías (AGREGAR_ENTIDAD, etc.)
- [ ] Día 5: Revisión final

**Semana 9:**
- [ ] Buffer para correcciones
- [ ] Revisión de coverage
- [ ] Documentación final

---

## Métricas de Éxito

### Antes de la Refactorización

| Métrica | Valor |
|---------|-------|
| Total líneas | 2,845 |
| Código duplicado | 35% |
| Archivos > 200 líneas | 8 |
| Archivos > 300 líneas | 1 |
| Coverage tests | 0% |
| Documentación | 1 archivo |

### Después de la Refactorización

| Métrica | Objetivo |
|---------|----------|
| Total líneas | ~2,000 (-30%) |
| Código duplicado | <10% |
| Archivos > 200 líneas | <3 |
| Archivos > 300 líneas | 0 |
| Coverage tests | >60% |
| Documentación | Completa |

---

## Notas Finales

### Principios a Mantener

1. **DRY (Don't Repeat Yourself)** - Evitar duplicación
2. **Single Responsibility** - Una función, una responsabilidad
3. **Separation of Concerns** - Separar UI, lógica y datos
4. **Composition over Inheritance** - Usar hooks y componentes
5. **Progressive Enhancement** - Mejorar incrementalmente

### Cuando NO Refactorizar

- Si el código funciona y no necesita cambios
- Si la complejidad es inherente al dominio
- Si el ROI es bajo (poco uso, poco cambio)

### Testing During Refactor

Después de cada tarea grande:
1. Probar manualmente toda la funcionalidad afectada
2. Ejecutar tests automatizados
3. Verificar que no hay regresiones
4. Commit con mensaje descriptivo

---

¿Listo para empezar? 🚀

**Sugerencia:** Comienza con la Fase 1, Tarea 1.1 (crear `useFormModal`).
