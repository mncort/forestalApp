import { fetchRecords, createRecord } from './base';
import { TABLES } from '../nocodb-config';

/**
 * Obtiene todos los costos
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de costos
 */
export const getCostos = async (options = {}) => {
  return fetchRecords(TABLES.costos, options);
};

/**
 * Obtiene costos de un producto específico filtrando en la API
 * @param {string} productoId - ID del producto
 * @returns {Promise<Array>} Array de costos del producto
 */
export const getCostosByProducto = async (productoId) => {
  // Filtrar en la API de NocoDB para traer solo los costos de este producto
  const where = `(nc_1g29__Productos_id,eq,${productoId})`;
  return fetchRecords(TABLES.costos, { where });
};

/**
 * Obtiene el costo actual/vigente de un producto (versión síncrona)
 * Usar cuando ya tienes el array de costos cargado
 * @param {Array} costos - Array de todos los costos
 * @param {string} productoId - ID del producto
 * @returns {Object|null} Costo vigente o null
 */
export const getCostoActual = (costos, productoId) => {
  if (!costos || !productoId) return null;

  // Filtrar costos del producto
  const costosProd = costos.filter(
    c => c.fields?.Productos?.id === productoId
  );

  if (costosProd.length === 0) return null;

  // Obtener fecha actual
  const hoy = new Date().toISOString().split('T')[0];

  // Filtrar costos vigentes (sin fecha hasta o fecha hasta >= hoy)
  const vigentes = costosProd.filter(
    c => !c.fields.FechaHasta || c.fields.FechaHasta >= hoy
  );

  if (vigentes.length === 0) return null;

  // Ordenar por fecha desde (más reciente primero)
  vigentes.sort((a, b) =>
    (b.fields?.FechaDesde || '').localeCompare(a.fields?.FechaDesde || '')
  );

  return vigentes[0];
};

/**
 * Obtiene el costo actual/vigente de un producto (versión async optimizada)
 * Usar cuando NO tienes los costos y necesitas buscarlos
 * Filtra en la API para traer solo los costos de este producto
 * @param {string} productoId - ID del producto
 * @returns {Promise<Object|null>} Costo vigente o null
 */
export const getCostoActualAsync = async (productoId) => {
  // Traer solo los costos de este producto desde la API
  const costos = await getCostosByProducto(productoId);
  return getCostoActual(costos, productoId);
};

/**
 * Obtiene el historial de costos de un producto (costos no vigentes) - versión sync
 * @param {Array} costos - Array de todos los costos
 * @param {string} productoId - ID del producto
 * @returns {Array} Array de costos históricos ordenados
 */
export const getHistorialCostos = (costos, productoId) => {
  if (!costos || !productoId) return [];

  // Obtener costos del producto
  const costosProd = costos.filter(
    c => c.fields?.Productos?.id === productoId
  );

  // Ordenar por fecha desde (más reciente primero)
  costosProd.sort((a, b) =>
    (b.fields?.FechaDesde || '').localeCompare(a.fields?.FechaDesde || '')
  );

  // Obtener el costo actual
  const costoActual = getCostoActual(costos, productoId);

  // Retornar todos excepto el actual
  return costosProd.filter(c => c.id !== costoActual?.id);
};

/**
 * Obtiene el historial de costos de un producto (versión async optimizada)
 * Filtra en la API para traer solo los costos de este producto
 * @param {string} productoId - ID del producto
 * @returns {Promise<Array>} Array de costos históricos ordenados
 */
export const getHistorialCostosAsync = async (productoId) => {
  // Traer solo los costos de este producto desde la API
  const costos = await getCostosByProducto(productoId);
  return getHistorialCostos(costos, productoId);
};

/**
 * Crea un nuevo costo para un producto
 * @param {Object} costoData - Datos del costo
 * @param {number} costoData.costo - Monto del costo
 * @param {string} costoData.moneda - Moneda (ARS, USD, etc)
 * @param {string} costoData.fechaDesde - Fecha de inicio de vigencia
 * @param {string} costoData.fechaHasta - Fecha de fin de vigencia (opcional)
 * @param {string} costoData.productoId - ID del producto
 * @returns {Promise<Object>} Costo creado
 */
export const crearCosto = async (costoData) => {
  const { costo, moneda, fechaDesde, fechaHasta, productoId } = costoData;

  return createRecord(TABLES.costos, {
    Costo: parseFloat(costo),
    Moneda: moneda,
    FechaDesde: fechaDesde,
    FechaHasta: fechaHasta || null,
    nc_1g29__Productos_id: productoId
  });
};

/**
 * Calcula el precio de venta aplicando markup de la categoría
 * @param {number} costo - Costo del producto
 * @param {number} markup - Porcentaje de markup
 * @returns {number} Precio de venta
 */
export const calcularPrecioVenta = (costo, markup) => {
  if (!costo || !markup) return 0;
  return costo * (1 + markup / 100);
};
