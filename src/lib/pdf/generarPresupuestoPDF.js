import ReactPDF from '@react-pdf/renderer';
import { prepararDatosPresupuesto } from './formatters';

/**
 * Genera un PDF del presupuesto usando react-pdf/renderer
 * Esta es la función centralizada para generar PDFs tanto en backend como frontend
 * @param {Object} presupuesto - Datos del presupuesto
 * @param {Array} items - Items del presupuesto
 * @param {Function} PDFComponent - Componente PDF a renderizar (inyección de dependencia)
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function generarPDFPresupuesto(presupuesto, items, PDFComponent) {
  // 1. Preparar datos para el PDF
  const efectivo = presupuesto.fields.efectivo || false;

  // Calcular precios de los items
  const itemsConPrecios = items.map(item => ({
    ...item,
    cantidad: parseFloat(item.fields.Cantidad) || 0,
    precioUnitario: parseFloat(item.fields.PrecioUnitario) || 0,
    subtotal: (parseFloat(item.fields.Cantidad) || 0) * (parseFloat(item.fields.PrecioUnitario) || 0),
    productoNested: item.fields.nc_1g29__Productos_id
  }));

  const pdfData = prepararDatosPresupuesto(presupuesto, itemsConPrecios, efectivo);

  // 2. Generar PDF usando react-pdf/renderer con componente inyectado
  const pdfStream = await ReactPDF.renderToStream(<PDFComponent data={pdfData} />);

  // 3. Convertir stream a buffer
  const chunks = [];
  for await (const chunk of pdfStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  return buffer;
}
