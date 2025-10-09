import { NOCODB_URL, HEADERS, BASE_ID } from '../nocodb-config';

/**
 * Clase de error personalizada para errores de API
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Función genérica para hacer fetch a NocoDB API v3
 * @param {string} tableId - ID de la tabla en NocoDB
 * @param {Object} options - Opciones de configuración
 * @param {number} options.limit - Límite de registros a obtener
 * @param {number} options.offset - Offset para paginación
 * @param {string} options.where - Filtro WHERE en formato NocoDB
 * @param {string} options.sort - Ordenamiento
 * @returns {Promise<Array>} Array de registros
 */
export const fetchRecords = async (tableId, options = {}) => {
  const {
    limit = 100,
    offset = 0,
    where = null,
    sort = null
  } = options;

  try {
    // Construir query params
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (where) params.append('where', where);
    if (sort) params.append('sort', sort);

    const url = `${NOCODB_URL}/api/v3/data/${BASE_ID}/${tableId}/records?${params}`;

    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Error al obtener registros: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data.records || data.list || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Error de conexión: ${error.message}`,
      0,
      null
    );
  }
};

/**
 * Función genérica para crear un registro en NocoDB API v2
 * @param {string} tableId - ID de la tabla en NocoDB
 * @param {Object} data - Datos del registro a crear
 * @returns {Promise<Object>} Registro creado
 */
export const createRecord = async (tableId, data) => {
  try {
    const url = `${NOCODB_URL}/api/v2/tables/${tableId}/records`;

    const response = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Error al crear registro: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Error de conexión: ${error.message}`,
      0,
      null
    );
  }
};

/**
 * Función genérica para actualizar un registro en NocoDB
 * @param {string} tableId - ID de la tabla en NocoDB
 * @param {string} recordId - ID del registro a actualizar
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Registro actualizado
 */
export const updateRecord = async (tableId, recordId, data) => {
  try {
    const url = `${NOCODB_URL}/api/v2/tables/${tableId}/records`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ id: recordId, ...data })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Error al actualizar registro: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Error de conexión: ${error.message}`,
      0,
      null
    );
  }
};

/**
 * Función genérica para eliminar un registro en NocoDB
 * @param {string} tableId - ID de la tabla en NocoDB
 * @param {string} recordId - ID del registro a eliminar
 * @returns {Promise<void>}
 */
export const deleteRecord = async (tableId, recordId) => {
  try {
    const url = `${NOCODB_URL}/api/v2/tables/${tableId}/records`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: HEADERS,
      body: JSON.stringify({ id: recordId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Error al eliminar registro: ${response.statusText}`,
        response.status,
        errorData
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Error de conexión: ${error.message}`,
      0,
      null
    );
  }
};
