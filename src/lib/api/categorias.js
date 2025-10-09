import { fetchRecords } from './base';
import { TABLES } from '../nocodb-config';

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
