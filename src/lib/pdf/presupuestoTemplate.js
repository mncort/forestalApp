/**
 * Template HTML para el presupuesto
 * @param {Object} data - Datos del presupuesto
 * @param {string} data.presupuestoId - ID del presupuesto
 * @param {string} data.fecha - Fecha formateada
 * @param {string} data.cliente - Nombre del cliente
 * @param {string} data.tipoFactura - Tipo de factura
 * @param {Array} data.items - Lista de items del presupuesto
 * @param {number} data.subtotal - Subtotal
 * @param {number} data.impuesto - Impuesto
 * @param {number} data.total - Total
 * @param {string} data.moneda - Moneda
 * @param {number} data.porcentajeImpuesto - Porcentaje de impuesto
 * @returns {string} HTML del presupuesto
 */
export function getPresupuestoTemplate(data) {
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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
          }
          .info-section {
            margin-bottom: 25px;
          }
          .info-section h2 {
            font-size: 16px;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-section p {
            font-size: 18px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals {
            margin-top: 30px;
            float: right;
            width: 300px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.final {
            border-top: 2px solid #2563eb;
            margin-top: 10px;
            padding-top: 12px;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            margin-top: 80px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PRESUPUESTO</h1>
          <div class="header-info">
            <div>
              <strong>Número:</strong> #${presupuestoId}
            </div>
            <div>
              <strong>Fecha:</strong> ${fecha}
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Cliente</h2>
          <p>${cliente || 'N/A'}</p>
        </div>

        <div class="info-section">
          <h2>Tipo de Factura</h2>
          <p>${tipoFactura === 'con_factura' ? 'Con Factura (21% IVA)' : 'Sin Factura (10.5% IVA)'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th class="text-center">Cantidad</th>
              <th class="text-right">Precio Unit.</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.nombre}</td>
                <td>${item.sku}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-right">$${item.precioUnitario.toFixed(2)} ${item.moneda}</td>
                <td class="text-right">$${item.subtotal.toFixed(2)} ${item.moneda}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)} ${moneda}</span>
          </div>
          <div class="total-row">
            <span>IVA (${porcentajeImpuesto}%):</span>
            <span>$${impuesto.toFixed(2)} ${moneda}</span>
          </div>
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)} ${moneda}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          <p>Presupuesto generado el ${new Date().toLocaleString('es-AR')}</p>
        </div>
      </body>
    </html>
  `;
}
