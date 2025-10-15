import { getPresupuestoHTML } from './presupuestoTemplate';

/**
 * Genera el HTML del presupuesto y retorna una URL para visualizarlo en un modal
 * Esta función prepara los datos y retorna un objeto URL que puede usarse en un iframe
 *
 * @param {Object} presupuesto - Objeto del presupuesto
 * @param {Array} itemsConPrecios - Items del presupuesto con precios calculados
 * @param {string} tipoFactura - Tipo de factura (con_factura o sin_factura)
 * @returns {Object} { url, cleanup } - URL del blob y función para limpiar
 */
export function generarPresupuestoPDF(presupuesto, itemsConPrecios, tipoFactura) {
  // Validar que hay items
  if (!itemsConPrecios || itemsConPrecios.length === 0) {
    throw new Error('No hay items en el presupuesto');
  }

  // Preparar datos
  const presupuestoId = String(presupuesto?.id || '').substring(0, 8);
  const fecha = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calcular totales
  const subtotal = itemsConPrecios.reduce((sum, item) => sum + item.subtotal, 0);
  const moneda = itemsConPrecios.length > 0 ? itemsConPrecios[0].fields?.Moneda : 'ARS';
  const porcentajeImpuesto = tipoFactura === 'con_factura' ? 21 : 10.5;
  const impuesto = subtotal * (porcentajeImpuesto / 100);
  const total = subtotal + impuesto;

  // Formatear items para el template
  const itemsFormateados = itemsConPrecios.map(item => ({
    nombre: item.productoNested?.Nombre || 'N/A',
    sku: item.productoNested?.SKU || 'N/A',
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
    moneda: item.fields.Moneda
  }));

  // Datos para el template
  const templateData = {
    presupuestoId,
    fecha,
    cliente: presupuesto?.fields.Cliente,
    tipoFactura,
    items: itemsFormateados,
    subtotal,
    impuesto,
    total,
    moneda,
    porcentajeImpuesto
  };

  // Generar HTML del presupuesto
  const htmlContent = getPresupuestoHTML(templateData);

  // Crear blob con el HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Retornar URL y función de limpieza
  return {
    url,
    fileName: `Presupuesto_${presupuestoId}_${presupuesto?.fields.Cliente?.replace(/\s+/g, '_')}.html`,
    cleanup: () => URL.revokeObjectURL(url)
  };
}
