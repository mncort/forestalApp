// Barrel file - Re-exporta todas las funciones de la API

// Base
export { ApiError, fetchRecords, createRecord, updateRecord, deleteRecord } from './base';

// Categorías
export {
  getCategorias,
  getSubcategorias,
  getSubcategoriasByCategoria,
  getCategoriaById
} from './categorias';

// Productos
export {
  getProductos,
  countProductos,
  getProductoById,
  getProductosBySubcategoria,
  getProductosByCategoria,
  searchProductos
} from './productos';

// Costos
export {
  getCostos,
  getCostosByProducto,
  getCostoActual,
  getCostoActualAsync,
  getHistorialCostos,
  getHistorialCostosAsync,
  crearCosto,
  calcularPrecioVenta
} from './costos';

// Mantener compatibilidad con nombres antiguos (DEPRECADOS)
// TODO: Remover cuando se actualicen todos los componentes
export { getCategorias as fetchCategorias } from './categorias';
export { getSubcategorias as fetchSubcategorias } from './categorias';
export { getProductos as fetchProductos } from './productos';
export { getCostos as fetchCostos } from './costos';
