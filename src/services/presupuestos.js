import { fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';
import { esEditable, ESTADOS_PRESUPUESTO } from '@/lib/stateMachine/presupuestoStates';
import { ApiError } from '@/lib/errors/ApiError';
// Las funciones de cálculo se movieron a lib/calculations/presupuestos.js

/**
 * Cuenta el número total de presupuestos
 * @param {Object} options - Opciones de filtrado (where)
 * @returns {Promise<number>} Número total de presupuestos
 */
export const countPresupuestos = async (options = {}) => {
  return countRecords(TABLES.presupuestos, options);
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
  try {
    // Buscar directamente por ID usando where
    const presupuestos = await fetchRecords(TABLES.presupuestos, {
      where: `(Id,eq,${presupuestoId})`,
      limit: 1
    });

    if (!presupuestos || presupuestos.length === 0) {
      return null;
    }

    const presupuesto = presupuestos[0];

    // Enriquecer con datos del cliente si existe
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
  } catch (error) {
    console.error('Error obteniendo presupuesto por ID:', error);
    return null;
  }
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
 * Valida si un presupuesto es editable
 * @param {string} presupuestoId - ID del presupuesto
 * @returns {Promise<void>} Lanza error si no es editable
 */
export const validarEditable = async (presupuestoId) => {
  const presupuesto = await getPresupuestoById(presupuestoId);

  if (!presupuesto) {
    throw ApiError.notFound('Presupuesto no encontrado');
  }

  const estado = presupuesto.fields.Estado || ESTADOS_PRESUPUESTO.BORRADOR;

  if (!esEditable(estado)) {
    throw ApiError.forbidden(
      'El presupuesto no puede modificarse porque ya fue enviado.',
      { estado }
    );
  }
};

/**
 * Actualiza un presupuesto existente
 * Solo permite actualizar si está en estado "borrador"
 * @param {string} presupuestoId - ID del presupuesto
 * @param {Object} presupuestoData - Datos a actualizar
 * @param {boolean} skipValidation - Omitir validación de editable (solo para cambio de estado)
 * @returns {Promise<Object>} Presupuesto actualizado
 */
export const actualizarPresupuesto = async (presupuestoId, presupuestoData, skipValidation = false) => {
  // Solo validar si NO es un cambio de estado (skipValidation = false)
  if (!skipValidation && presupuestoData.Estado === undefined) {
    await validarEditable(presupuestoId);
  }

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


// Las funciones de items de presupuesto se movieron a presupuestoItems.js
