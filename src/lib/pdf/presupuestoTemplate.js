/**
 * TEMPLATE HTML/CSS PARA EL PDF
 * Acá podés editar TODO el diseño usando HTML y CSS normales
 */

export function getPresupuestoHTML(data) {
  const {
    presupuestoId,
    fecha,
    cliente,
    tipoFactura,
    items,
    subtotal,
    impuesto,
    total,
    moneda,
    porcentajeImpuesto
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Presupuesto #${presupuestoId}</title>
  <style>
    /* ===== RESET Y CONFIGURACIÓN BÁSICA ===== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      padding: 30px;
      color: #333;
      background: white;
      font-size: 11pt;
    }

    /* ===== HEADER CON FONDO AZUL ===== */
    .header {
      background: #2563eb;
      color: white;
      padding: 20px 30px;
      margin: -30px -30px 30px -30px;
      border-radius: 0;
    }

    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32pt;
      font-weight: bold;
    }

    .header-info {
      display: flex;
      justify-content: space-between;
      font-size: 11pt;
    }

    /* ===== SECCIONES DE INFORMACIÓN ===== */
    .info-section {
      margin-bottom: 20px;
    }

    .info-section h2 {
      font-size: 10pt;
      color: #666;
      text-transform: uppercase;
      margin: 0 0 5px 0;
      letter-spacing: 1px;
      font-weight: bold;
    }

    .info-section p {
      margin: 0;
      font-size: 14pt;
      font-weight: 600;
      color: #000;
    }

    /* ===== TABLA DE PRODUCTOS ===== */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 10pt;
    }

    thead {
      background: #f3f4f6;
    }

    th {
      padding: 12px 8px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #e5e7eb;
      font-size: 9pt;
    }

    th.text-right {
      text-align: right;
    }

    th.text-center {
      text-align: center;
    }

    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 9pt;
    }

    tbody tr:nth-child(even) {
      background: #f9fafb;
    }

    tbody tr:hover {
      background: #f3f4f6;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    /* ===== SECCIÓN DE TOTALES ===== */
    .totals {
      margin-top: 30px;
      float: right;
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 11pt;
    }

    .total-row.subtotal {
      padding-bottom: 5px;
    }

    .total-row.impuesto {
      padding-bottom: 10px;
    }

    .total-row.final {
      border-top: 2px solid #2563eb;
      margin-top: 10px;
      padding-top: 12px;
      font-size: 16pt;
      font-weight: bold;
      color: #2563eb;
    }

    /* ===== FOOTER ===== */
    .footer {
      clear: both;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }

    /* ===== ESTILOS PARA IMPRESIÓN/PDF ===== */
    @media print {
      body {
        padding: 20px;
      }

      .header {
        margin: -20px -20px 20px -20px;
      }

      /* Evitar saltos de página dentro de filas */
      tr {
        page-break-inside: avoid;
      }

      /* Asegurar que los colores se impriman */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>PRESUPUESTO</h1>
    <div class="header-info">
      <div>Número: #${presupuestoId}</div>
      <div>Fecha: ${fecha}</div>
    </div>
  </div>

  <!-- INFORMACIÓN DEL CLIENTE -->
  <div class="info-section">
    <h2>Cliente</h2>
    <p>${cliente || 'N/A'}</p>
  </div>

  <!-- TIPO DE FACTURA -->
  <div class="info-section">
    <h2>Tipo de Factura</h2>
    <p>${tipoFactura === 'con_factura' ? 'Con Factura (21% IVA)' : 'Sin Factura (10.5% IVA)'}</p>
  </div>

  <!-- TABLA DE PRODUCTOS -->
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Producto</th>
        <th class="text-center">Cantidad</th>
        <th class="text-right">Precio Unit.</th>
        <th class="text-right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.sku}</td>
          <td>${item.nombre}</td>
          <td class="text-center">${item.cantidad}</td>
          <td class="text-right">$${item.precioUnitario.toFixed(2)} ${item.moneda}</td>
          <td class="text-right">$${item.subtotal.toFixed(2)} ${item.moneda}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- TOTALES -->
  <div class="totals">
    <div class="total-row subtotal">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)} ${moneda}</span>
    </div>
    <div class="total-row impuesto">
      <span>IVA (${porcentajeImpuesto}%):</span>
      <span>$${impuesto.toFixed(2)} ${moneda}</span>
    </div>
    <div class="total-row final">
      <span>TOTAL:</span>
      <span>$${total.toFixed(2)} ${moneda}</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Presupuesto generado el ${new Date().toLocaleString('es-AR')}</p>
  </div>
</body>
</html>
  `;
}
