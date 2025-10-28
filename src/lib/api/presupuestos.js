import { fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from './base';
import { TABLES } from '../nocodb-config';
import { getCostoActual } from './costos';

/**
 * Cuenta el número total de presupuestos
 * @returns {Promise<number>} Número total de presupuestos
 */
export const countPresupuestos = async () => {
  return countRecords(TABLES.presupuestos);
};

/**
 * Obtiene todos los presupuestos con información del cliente
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de presupuestos
 */
export const getPresupuestos = async (options = {}) => {
  const presupuestos = await fetchRecords(TABLES.presupuestos, options);

  // Enriquecer cada presupuesto con los datos completos del cliente
  const presupuestosEnriquecidos = await Promise.all(
    presupuestos.map(async (presupuesto) => {
      // Si tiene un cliente asignado, obtener sus datos completos
      const clienteId = presupuesto.fields.nc_1g29__Clientes_id;

      if (clienteId) {
        try {
          // Fetch del cliente completo
          const clientes = await fetchRecords(TABLES.clientes, {
            where: `(Id,eq,${clienteId})`,
            limit: 1
          });

          if (clientes.length > 0) {
            // Agregar los datos completos del cliente al presupuesto
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
