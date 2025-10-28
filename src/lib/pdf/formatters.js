/**
 * Formatea un número como dinero en formato argentino
 */
export const money = (value, moneda = 'ARS') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda
  }).format(value ?? 0);
};

/**
 * Prepara los datos del presupuesto para el PDF
 * Calcula totales y formatea los valores
 */
export function prepararDatosPresupuesto(presupuesto, itemsConPrecios, efectivo) {
  // Preparar datos básicos
  const presupuestoId = String(presupuesto?.id || '').substring(0, 8);
  const fecha = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Obtener moneda del primer item
  const moneda = itemsConPrecios.length > 0 ? itemsConPrecios[0].fields?.Moneda : 'ARS';

  // Formatear items con precios formateados
  const items = itemsConPrecios.map(item => {
    const subtotal = item.subtotal || 0;
    return {
      sku: item.productoNested?.SKU || 'N/A',
      nombre: item.productoNested?.Nombre || 'N/A',
      cantidad: item.cantidad || 0,
      precio: item.precioUnitario || 0,
      subtotal,
      precioFmt: money(item.precioUnitario, moneda),
      subtotalFmt: money(subtotal, moneda)
    };
  });

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  // Si efectivo = true → 10.5% IVA (medio IVA)
  // Si efectivo = false → 21% IVA (IVA completo)
  const porcentajeImpuesto = efectivo ? 10.5 : 21;
  const impuestos = subtotal * (porcentajeImpuesto / 100);
  const total = subtotal + impuestos;

  // Formatear texto de tipo de pago
  const tipoPagoTexto = efectivo
    ? `Efectivo - Medio IVA (${porcentajeImpuesto}%)`
    : `Tarjeta/Transferencia - IVA Completo (${porcentajeImpuesto}%)`;

  return {
    presupuestoId,
    fecha,
    cliente: presupuesto?.fields?.ClienteCompleto?.Nombre || 'Sin cliente',
    tipoFactura: tipoPagoTexto,
    items,
    totales: {
      subtotal,
      impuestos,
      total,
      porcentajeImpuesto,
      moneda,
      subtotalFmt: money(subtotal, moneda),
      impuestosFmt: money(impuestos, moneda),
      totalFmt: money(total, moneda)
    }
  };
}
