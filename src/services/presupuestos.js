import { fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';
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


// Las funciones de items de presupuesto se movieron a presupuestoItems.js
