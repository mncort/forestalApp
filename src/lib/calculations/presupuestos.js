import { getCostoActual } from '../../services/costos';

/**
 * Funciones de cálculo para presupuestos
 * Centralizadas para reutilización y testing
 */

/**
 * Obtiene el markup aplicable según orden de prioridad:
 * 1. Markup del Producto (si existe)
 * 2. Markup de la Subcategoría (si existe y producto no tiene)
 * 3. Markup de la Categoría (si los anteriores no existen)
 *
 * @param {Object} producto - Objeto producto con sus datos
 * @param {Object} subcategoria - Objeto subcategoría (puede ser null)
 * @param {Object} categoria - Objeto categoría (puede ser null)
 * @returns {number} Markup a aplicar (porcentaje)
 */
export const obtenerMarkupAplicable = (producto, subcategoria, categoria) => {
  // Prioridad 1: Markup del producto
  if (producto?.fields?.Markup != null && producto.fields.Markup !== '') {
    const markup = parseFloat(producto.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Prioridad 2: Markup de la subcategoría
  if (subcategoria?.fields?.Markup != null && subcategoria.fields.Markup !== '') {
    const markup = parseFloat(subcategoria.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Prioridad 3: Markup de la categoría
  if (categoria?.fields?.Markup != null && categoria.fields.Markup !== '') {
    const markup = parseFloat(categoria.fields.Markup);
    if (!isNaN(markup)) return markup;
  }

  // Si no hay markup definido, retornar 0
  return 0;
};

/**
 * Calcula el precio de venta de un producto aplicando el markup correspondiente
 *
 * @param {Object} producto - Producto con sus datos
 * @param {Object} subcategoria - Subcategoría del producto
 * @param {Object} categoria - Categoría del producto
 * @param {Array} costos - Array de costos para buscar el costo actual
 * @returns {Object} Objeto con costo, markup aplicado, y precio de venta
 */
export const calcularPrecioProducto = (producto, subcategoria, categoria, costos) => {
  // Validar que el producto existe
  if (!producto || !producto.id) {
    return {
      costo: 0,
      markup: 0,
      precioVenta: 0,
      moneda: null,
      tieneCosto: false
    };
  }

  // Obtener el costo actual del producto
  const costoActual = getCostoActual(costos, producto.id);

  if (!costoActual) {
    return {
      costo: 0,
      markup: 0,
      precioVenta: 0,
      moneda: null,
      tieneCosto: false
    };
  }

  const costo = parseFloat(costoActual.fields.Costo);
  const markup = obtenerMarkupAplicable(producto, subcategoria, categoria);
  const precioVenta = costo * (1 + markup / 100);

  return {
    costo,
    markup,
    precioVenta,
    moneda: costoActual.fields.Moneda,
    tieneCosto: true
  };
};

/**
 * Calcula el total de un presupuesto sumando todos sus items
 *
 * @param {Array} items - Array de items del presupuesto
 * @returns {Object} Objeto con subtotal, total y moneda
 */
export const calcularTotalPresupuesto = (items) => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      total: 0,
      moneda: null,
      cantidadItems: 0
    };
  }

  // Asumir que todos los items están en la misma moneda
  const moneda = items[0]?.fields?.Moneda || null;

  const subtotal = items.reduce((sum, item) => {
    const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
    const cantidad = parseFloat(item.fields?.Cantidad) || 0;
    return sum + (precio * cantidad);
  }, 0);

  return {
    subtotal,
    total: subtotal,
    moneda,
    cantidadItems: items.length
  };
};

/**
 * Aplica descuento por efectivo si corresponde
 *
 * @param {number} total - Total del presupuesto
 * @param {boolean} efectivo - Si se paga en efectivo
 * @param {number} descuentoEfectivo - Porcentaje de descuento (default 50% del IVA = 10.5%)
 * @returns {Object} Totales con y sin descuento
 */
export const aplicarDescuentoEfectivo = (total, efectivo, descuentoEfectivo = 10.5) => {
  if (!efectivo) {
    return {
      subtotal: total,
      descuento: 0,
      total: total,
      tieneDescuento: false
    };
  }

  const descuento = total * (descuentoEfectivo / 100);
  const totalConDescuento = total - descuento;

  return {
    subtotal: total,
    descuento,
    total: totalConDescuento,
    tieneDescuento: true,
    porcentajeDescuento: descuentoEfectivo
  };
};
