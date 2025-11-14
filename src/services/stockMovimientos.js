import { fetchRecords, createRecord, countRecords } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';

/**
 * Obtiene todos los movimientos de stock
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de movimientos
 */
export const getStockMovimientos = async (options = {}) => {
  return fetchRecords(TABLES.stockMovimientos, options);
};

/**
 * Cuenta el total de movimientos de stock
 * @param {Object} options - Opciones de filtrado (where)
 * @returns {Promise<number>} Total de movimientos
 */
export const countStockMovimientos = async (options = {}) => {
  return countRecords(TABLES.stockMovimientos, options);
};

/**
 * Obtiene los movimientos de un producto específico
 * @param {string} productoId - ID del producto
 * @param {Object} options - Opciones adicionales (limit, offset, sort)
 * @returns {Promise<Array>} Array de movimientos del producto
 */
export const getMovimientosByProducto = async (productoId, options = {}) => {
  if (!productoId) {
    throw new Error('ID de producto no válido');
  }

  try {
    // Obtener todos los movimientos (el filtro where no funciona correctamente con links en API v3)
    // Por eso obtenemos todos y filtramos manualmente
    const allMovimientos = await fetchRecords(TABLES.stockMovimientos, {
      limit: options.limit || 1000
    });

    // Filtrar por producto
    const movimientosFiltrados = allMovimientos.filter(mov => {
      const productoIdField = mov.fields?.nc_1g29__Productos_id;
      const productosField = mov.fields?.Productos;

      // Comparar con el ID del producto
      return productoIdField === productoId ||
             (typeof productosField === 'object' && productosField?.id === productoId);
    });

    // Ordenar por fecha descendente (más reciente primero)
    movimientosFiltrados.sort((a, b) => {
      const dateA = new Date(a.fields?.CreatedAt || 0);
      const dateB = new Date(b.fields?.CreatedAt || 0);
      return dateB - dateA; // Orden descendente
    });

    return movimientosFiltrados;
  } catch (error) {
    console.error('Error en getMovimientosByProducto:', error);
    if (error.message && error.message.includes('not found')) {
      return [];
    }
    throw error;
  }
};

/**
 * Crea un nuevo movimiento de stock
 * @param {Object} movimientoData - Datos del movimiento
 * @param {number} movimientoData.nc_1g29__Productos_id - ID del producto (link field)
 * @param {string} movimientoData.Tipo - Tipo: Entrada, Salida, Consolidado
 * @param {string} movimientoData.Motivo - Motivo: Venta, Compra, Ajuste de inventario
 * @param {number} movimientoData.Cantidad - Cantidad (positivo para entrada, negativo para salida)
 * @param {string} movimientoData.Detalle - Detalle opcional
 * @param {string} movimientoData.nc_1g29___Presupuesto_Items_id - ID del item de presupuesto (opcional)
 * @returns {Promise<Object>} Movimiento creado
 */
export const crearMovimiento = async (movimientoData) => {
  // Validar que el producto esté presente
  if (!movimientoData.nc_1g29__Productos_id) {
    throw new Error('El campo nc_1g29__Productos_id es requerido');
  }

  // Validar que la cantidad tenga el signo correcto según el tipo
  const { Tipo, Cantidad } = movimientoData;

  let cantidadFinal = parseFloat(Cantidad);

  // Asegurar el signo correcto según el tipo
  if (Tipo === 'Entrada' && cantidadFinal < 0) {
    cantidadFinal = Math.abs(cantidadFinal);
  } else if (Tipo === 'Salida' && cantidadFinal > 0) {
    cantidadFinal = -Math.abs(cantidadFinal);
  }

  const dataToSend = {
    ...movimientoData,
    Cantidad: cantidadFinal
  };

  try {
    const result = await createRecord(TABLES.stockMovimientos, dataToSend);
    return result;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

/**
 * Calcula el stock actual de un producto sumando todos sus movimientos
 * Esta función es un backup en caso de que el Rollup de NocoDB no esté disponible
 * @param {string} productoId - ID del producto
 * @returns {Promise<number>} Stock actual calculado
 */
export const calcularStockActual = async (productoId) => {
  const movimientos = await getMovimientosByProducto(productoId, { limit: 10000 });

  return movimientos.reduce((total, mov) => {
    const cantidad = parseFloat(mov.fields?.Cantidad || 0);
    return total + cantidad;
  }, 0);
};
