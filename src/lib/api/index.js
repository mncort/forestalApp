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
  countPresupuestos,
  getPresupuestoById,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto
} from './presupuestos';

// Items de Presupuestos
export {
  getPresupuestoItems,
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem
} from './presupuestoItems';

// Cálculos de presupuestos
export {
  obtenerMarkupAplicable,
  calcularPrecioProducto,
  calcularTotalPresupuesto,
  aplicarDescuentoEfectivo
} from '../calculations/presupuestos';

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
