import { fetchRecords, createRecord, updateRecord } from './base';
import { TABLES, NOCODB_URL, BASE_ID, HEADERS } from '../nocodb-config';

/**
 * Obtener todos los clientes con opciones de filtrado
 */
export const getClientes = async (options = {}) => {
  return fetchRecords(TABLES.clientes, options);
};

/**
 * Obtener un cliente por ID
 */
export const getClienteById = async (id) => {
  const clientes = await fetchRecords(TABLES.clientes, {
    where: `(Id,eq,${id})`,
    limit: 1
  });
  return clientes[0] || null;
};

/**
 * Contar clientes
 */
export const countClientes = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.where) params.append('where', options.where);

    const url = `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.clientes}/count?${params}`;
    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
      throw new Error(`Error al contar clientes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error contando clientes:', error);
    return 0;
  }
};

/**
 * Crear un nuevo cliente
 */
export const crearCliente = async (clienteData) => {
  // Validar datos requeridos
  if (!clienteData.Nombre || clienteData.Nombre.trim() === '') {
    throw new Error('El nombre es requerido');
  }

  return createRecord(TABLES.clientes, clienteData);
};

/**
 * Actualizar un cliente existente
 */
export const actualizarCliente = async (id, clienteData) => {
  // Validar datos requeridos
  if (clienteData.Nombre !== undefined && clienteData.Nombre.trim() === '') {
    throw new Error('El nombre es requerido');
  }

  return updateRecord(TABLES.clientes, id, clienteData);
};

/**
 * Validar formato de CUIT (formato argentino: 20-12345678-9)
 */
export const validarCUIT = (cuit) => {
  if (!cuit) return true; // CUIT opcional
  const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
  return cuitRegex.test(cuit);
};

/**
 * Validar formato de email
 */
export const validarEmail = (email) => {
  if (!email) return true; // Email opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
