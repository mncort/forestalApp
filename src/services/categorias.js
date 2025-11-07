import { fetchRecords, createRecord, updateRecord } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';

/**
 * Obtiene todas las categorías
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de categorías
 */
export const getCategorias = async (options = {}) => {
  return fetchRecords(TABLES.categorias, options);
};

/**
 * Obtiene todas las subcategorías
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de subcategorías
 */
export const getSubcategorias = async (options = {}) => {
  return fetchRecords(TABLES.subcategorias, options);
};

/**
 * Obtiene subcategorías filtradas por categoría
 * @param {string} categoriaId - ID de la categoría
 * @returns {Promise<Array>} Array de subcategorías de esa categoría
 */
export const getSubcategoriasByCategoria = async (categoriaId) => {
  const subcategorias = await getSubcategorias();
  return subcategorias.filter(
    sub => sub.fields.nc_1g29__Categorias_id === categoriaId
  );
};

/**
 * Obtiene una categoría por ID
 * @param {string} categoriaId - ID de la categoría
 * @returns {Promise<Object|null>} Categoría o null si no existe
 */
export const getCategoriaById = async (categoriaId) => {
  const categorias = await getCategorias();
  return categorias.find(cat => cat.id === categoriaId) || null;
};

/**
 * Crea una nueva categoría
 * @param {Object} categoriaData - Datos normalizados para NocoDB
 * @returns {Promise<Object>} Categoría creada
 */
export const crearCategoria = async (categoriaData) => {
  return createRecord(TABLES.categorias, categoriaData);
};

/**
 * Actualiza una categoría existente
 * @param {string} id - ID de la categoría
 * @param {Object} categoriaData - Datos actualizados normalizados
 * @returns {Promise<Object>} Categoría actualizada
 */
export const actualizarCategoria = async (id, categoriaData) => {
  return updateRecord(TABLES.categorias, id, categoriaData);
};

/**
 * Crea una nueva subcategoría
 * @param {Object} subcategoriaData - Datos normalizados
 * @returns {Promise<Object>} Subcategoría creada
 */
export const crearSubcategoria = async (subcategoriaData) => {
  return createRecord(TABLES.subcategorias, subcategoriaData);
};

/**
 * Actualiza una subcategoría
 * @param {string} id - ID de la subcategoría
 * @param {Object} subcategoriaData - Datos actualizados normalizados
 * @returns {Promise<Object>} Subcategoría actualizada
 */
export const actualizarSubcategoria = async (id, subcategoriaData) => {
  return updateRecord(TABLES.subcategorias, id, subcategoriaData);
};
