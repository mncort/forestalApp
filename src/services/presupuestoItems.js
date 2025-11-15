import { fetchRecords, createRecord, updateRecord, deleteRecord } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';
import { validarEditable } from './presupuestos';

/**
 * API para Items de Presupuesto
 * Separado de presupuestos.js para mejor organización
 */

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
 * Solo permite crear si el presupuesto está en estado "borrador"
 * @param {Object} itemData - Datos del item
 * @returns {Promise<Object>} Item creado
 */
export const crearPresupuestoItem = async (itemData) => {
  // Validar que el presupuesto sea editable
  const presupuestoId = itemData.nc_1g29___Presupuestos_id;
  if (presupuestoId) {
    await validarEditable(presupuestoId);
  }

  return createRecord(TABLES.presupuestoItems, itemData);
};

/**
 * Actualiza un item de presupuesto existente
 * Solo permite actualizar si el presupuesto está en estado "borrador"
 * @param {string} itemId - ID del item
 * @param {Object} itemData - Datos a actualizar
 * @param {string} presupuestoId - ID del presupuesto (requerido para validación)
 * @returns {Promise<Object>} Item actualizado
 */
export const actualizarPresupuestoItem = async (itemId, itemData, presupuestoId) => {
  // Validar que el presupuesto sea editable
  if (presupuestoId) {
    await validarEditable(presupuestoId);
  }

  return updateRecord(TABLES.presupuestoItems, itemId, itemData);
};

/**
 * Elimina un item de presupuesto
 * Solo permite eliminar si el presupuesto está en estado "borrador"
 * @param {string} itemId - ID del item
 * @param {string} presupuestoId - ID del presupuesto (requerido para validación)
 * @returns {Promise<void>}
 */
export const eliminarPresupuestoItem = async (itemId, presupuestoId) => {
  // Validar que el presupuesto sea editable
  if (presupuestoId) {
    await validarEditable(presupuestoId);
  }

  return deleteRecord(TABLES.presupuestoItems, itemId);
};
