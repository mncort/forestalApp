// Barrel file - Re-exporta todas las funciones de la API

// Base
export { ApiError, fetchRecords, createRecord, updateRecord, deleteRecord, countRecords } from './base';

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

// Presupuestos
export {
  getPresupuestos,
  getPresupuestoById,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto,
  getPresupuestoItems,
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  obtenerMarkupAplicable,
  calcularPrecioProducto,
  calcularTotalPresupuesto
} from './presupuestos';

// Clientes
export {
  getClientes,
  getClienteById,
  countClientes,
  crearCliente,
  actualizarCliente,
  validarCUIT,
  validarEmail
} from './clientes';

// Dashboard
export {
  getResumenSemanal,
  getDatosGraficos
} from './dashboard';

// Mantener compatibilidad con nombres antiguos (DEPRECADOS)
// TODO: Remover cuando se actualicen todos los componentes
export { getCategorias as fetchCategorias } from './categorias';
export { getSubcategorias as fetchSubcategorias } from './categorias';
export { getProductos as fetchProductos } from './productos';
export { getCostos as fetchCostos } from './costos';
