import { getPresupuestoTemplate } from './presupuestoTemplate';

/**
 * Genera y abre un PDF del presupuesto
 * @param {Object} presupuesto - Objeto del presupuesto
 * @param {Array} itemsConPrecios - Items del presupuesto con precios calculados
 * @param {string} tipoFactura - Tipo de factura (con_factura o sin_factura)
 */
export function generarPresupuestoPDF(presupuesto, itemsConPrecios, tipoFactura) {
  console.log("Generando PDF para presupuesto:", presupuesto);
  console.log("Items con precios:", itemsConPrecios);
  console.log("Tipo de factura:", tipoFactura);
  // Validar que hay items
  if (!itemsConPrecios || itemsConPrecios.length === 0) {
    alert('No hay items en el presupuesto para generar el PDF');
    return;
  }

  // Crear ventana para imprimir
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para generar el PDF');
    return;
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
    nombre: item.fields?.Productos?.fields?.Nombre || 'N/A',
    sku: item.producto?.fields?.SKU || item.fields?.Productos?.fields?.SKU || 'N/A',
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

  // Generar HTML del template
  const htmlContent = getPresupuestoTemplate(templateData);

  // Escribir en la ventana
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Esperar a que se cargue y luego imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
