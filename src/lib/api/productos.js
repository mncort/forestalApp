import { fetchRecords } from './base';
import { TABLES } from '../nocodb-config';

/**
 * Obtiene todos los productos
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de productos
 */
export const getProductos = async (options = {}) => {
  return fetchRecords(TABLES.productos, options);
};

/**
 * Obtiene un producto por ID
 * @param {string} productoId - ID del producto
 * @returns {Promise<Object|null>} Producto o null si no existe
 */
export const getProductoById = async (productoId) => {
  const productos = await getProductos();
  return productos.find(prod => prod.id === productoId) || null;
};

/**
 * Obtiene productos por subcategoría
 * @param {string} subcategoriaId - ID de la subcategoría
 * @returns {Promise<Array>} Array de productos
 */
export const getProductosBySubcategoria = async (subcategoriaId) => {
  const productos = await getProductos();
  return productos.filter(
    prod => prod.fields.Subcategoria?.id === subcategoriaId
  );
};

/**
 * Obtiene productos por categoría
 * @param {string} categoriaId - ID de la categoría
 * @param {Array} subcategorias - Array de subcategorías (opcional)
 * @returns {Promise<Array>} Array de productos
 */
export const getProductosByCategoria = async (categoriaId, subcategorias = []) => {
  const productos = await getProductos();

  // Filtrar subcategorías de esta categoría
  const subcatsIds = subcategorias
    .filter(sub => sub.fields.nc_1g29__Categorias_id === categoriaId)
    .map(sub => sub.id);

  // Filtrar productos que pertenezcan a esas subcategorías
  return productos.filter(
    prod => subcatsIds.includes(prod.fields.Subcategoria?.id)
  );
};

/**
 * Busca productos por nombre o SKU
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de productos que coinciden
 */
export const searchProductos = async (searchTerm) => {
  const productos = await getProductos();
  const term = searchTerm.toLowerCase();

  return productos.filter(prod =>
    prod.fields.Nombre?.toLowerCase().includes(term) ||
    prod.fields.SKU?.toLowerCase().includes(term)
  );
};
