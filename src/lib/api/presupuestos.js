import { fetchRecords, createRecord, updateRecord, deleteRecord } from './base';
import { TABLES } from '../nocodb-config';
import { getCostoActual } from './costos';

/**
 * Obtiene todos los presupuestos
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de presupuestos
 */
export const getPresupuestos = async (options = {}) => {
  return fetchRecords(TABLES.presupuestos, options);
};

/**
 * Obtiene un presupuesto por ID
 * @param {string} presupuestoId - ID del presupuesto
 * @returns {Promise<Object|null>} Presupuesto o null si no existe
 */
export const getPresupuestoById = async (presupuestoId) => {
  const presupuestos = await getPresupuestos();
  return presupuestos.find(p => p.id === presupuestoId) || null;
};

/**
 * Crea un nuevo presupuesto
 * @param {Object} presupuestoData - Datos del presupuesto
 * @returns {Promise<Object>} Presupuesto creado
 */
export const crearPresupuesto = async (presupuestoData) => {
  return createRecord(TABLES.presupuestos, presupuestoData);
};

/**
 * Actualiza un presupuesto existente
 * @param {string} presupuestoId - ID del presupuesto
 * @param {Object} presupuestoData - Datos a actualizar
 * @returns {Promise<Object>} Presupuesto actualizado
 */
export const actualizarPresupuesto = async (presupuestoId, presupuestoData) => {
  return updateRecord(TABLES.presupuestos, presupuestoId, presupuestoData);
};

/**
 * Elimina un presupuesto
 * @param {string} presupuestoId - ID del presupuesto
 * @returns {Promise<void>}
 */
export const eliminarPresupuesto = async (presupuestoId) => {
  return deleteRecord(TABLES.presupuestos, presupuestoId);
};

// ===== Funciones para Items de Presupuesto =====

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
 * @returns {Promise<Array>} Array de items del presupuesto
 */
export const getItemsByPresupuesto = async (presupuestoId) => {
  const where = `(nc_1g29___Presupuestos_id,eq,${presupuestoId})`;
  return fetchRecords(TABLES.presupuestoItems, { where });
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

// ===== Funciones de Cálculo de Precio =====

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
 * @param {Object} producto - Producto con sus datos
 * @param {Object} subcategoria - Subcategoría del producto
 * @param {Object} categoria - Categoría del producto
 * @param {Array} costos - Array de costos para buscar el costo actual
 * @returns {Object} Objeto con costo, markup aplicado, y precio de venta
 */
export const calcularPrecioProducto = (producto, subcategoria, categoria, costos) => {
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

  // Obtener el costo actual del producto
  const costoActual = getCostoActual(costos, producto.id);

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
 * @param {Array} items - Array de items del presupuesto con precioVenta calculado
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
  const moneda = items[0]?.moneda || null;

  const subtotal = items.reduce((sum, item) => {
    const precio = parseFloat(item.precioVenta) || 0;
    const cantidad = parseFloat(item.cantidad) || 0;
    return sum + (precio * cantidad);
  }, 0);

  return {
    subtotal,
    total: subtotal,
    moneda,
    cantidadItems: items.length
  };
};
