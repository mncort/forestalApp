import { fetchRecords, createRecord, updateRecord } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';

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
 * Obtiene costos históricos archivados desde la tabla auxiliar
 * @param {string} productoId - ID del producto
 * @returns {Promise<Array>} Costos históricos almacenados en la tabla histórica
 */
export const getCostosArchivados = async (productoId) => {
  const where = `(nc_1g29__Productos_id,eq,${productoId})`;
  return fetchRecords(TABLES.costosHist, { where, limit: 100 });
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

  // Filtrar costos del producto (excluir costos con valor 0)
  const costosProd = costos.filter(
    c => c.fields?.Productos?.id === productoId &&
         parseFloat(c.fields?.Costo || 0) > 0
  );

  if (costosProd.length === 0) return null;

  // Obtener fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  // Filtrar costos vigentes: fecha_desde <= hoy AND (sin fecha_hasta OR fecha_hasta >= hoy)
  const vigentes = costosProd.filter(c => {
    const fechaDesde = c.fields.FechaDesde;
    const fechaHasta = c.fields.FechaHasta;

    // Debe haber empezado (fechaDesde <= hoy)
    const haEmpezado = fechaDesde && fechaDesde <= fechaHoy;

    // No debe haber terminado (sin fechaHasta o fechaHasta >= hoy)
    const noHaTerminado = !fechaHasta || fechaHasta >= fechaHoy;

    return haEmpezado && noHaTerminado;
  });

  if (vigentes.length === 0) return null;

  // Si hay múltiples vigentes, tomar el más reciente por fecha desde
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
 * Cierra el costo vigente y crea un nuevo registro para el producto
 * @param {string} productoId - ID del producto
 * @param {Object} costoNormalizado - Datos listos para NocoDB
 * @returns {Promise<{costoPrevioSinCierre: Object|null}>} Información del costo previo actualizado
 */
export const guardarCostoParaProducto = async (productoId, costoNormalizado) => {
  const costosProducto = await getCostosByProducto(productoId);

  const costoPrevioSinCierre = costosProducto.find(
    (costo) => !costo.fields.FechaHasta || costo.fields.FechaHasta === ''
  );

  if (costoPrevioSinCierre) {
    const fechaDesdeNueva = costoNormalizado.FechaDesde;
    if (fechaDesdeNueva) {
      const [year, month, day] = fechaDesdeNueva.split('-').map(Number);
      const fechaHastaPrevio = new Date(year, month - 1, day - 1);
      const fechaHastaStr = fechaHastaPrevio.toISOString().split('T')[0];

      await updateRecord(TABLES.costos, costoPrevioSinCierre.id, {
        FechaHasta: fechaHastaStr
      });
    }
  }

  await createRecord(TABLES.costos, costoNormalizado);

  return { costoPrevioSinCierre: costoPrevioSinCierre || null };
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
