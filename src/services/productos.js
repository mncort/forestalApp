import { fetchRecords, createRecord, updateRecord } from '@/models/nocodbRepository';
import { TABLES, NOCODB_URL, BASE_ID, HEADERS } from '@/models/nocodbConfig';

/**
 * Obtiene todos los productos
 * @param {Object} options - Opciones de paginación y filtrado
 * @returns {Promise<Array>} Array de productos
 */
export const getProductos = async (options = {}) => {
  return fetchRecords(TABLES.productos, options);
};

/**
 * Cuenta el total de productos
 * @param {Object} options - Opciones de filtrado (where)
 * @returns {Promise<number>} Total de productos
 */
export const countProductos = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.where) params.append('where', options.where);

    const url = `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.productos}/count?${params}`;
    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
      throw new Error(`Error al contar productos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error contando productos:', error);
    return 0;
  }
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

/**
 * Crea un nuevo producto en la base de datos
 * @param {Object} productoData - Datos ya normalizados para NocoDB
 * @returns {Promise<Object>} Producto creado
 */
export const crearProducto = async (productoData) => {
  return createRecord(TABLES.productos, productoData);
};

/**
 * Actualiza un producto existente en la base de datos
 * @param {string} id - ID del producto
 * @param {Object} productoData - Datos actualizados normalizados
 * @returns {Promise<Object>} Producto actualizado
 */
export const actualizarProducto = async (id, productoData) => {
  return updateRecord(TABLES.productos, id, productoData);
};
