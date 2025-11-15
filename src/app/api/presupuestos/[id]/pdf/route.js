import { NextResponse } from 'next/server';
import { getPresupuestoById } from '@/services/presupuestos';
import { requierePDFGuardado, ESTADOS_PRESUPUESTO } from '@/lib/stateMachine/presupuestoStates';
import { NOCODB_URL, API_TOKEN } from '@/models/nocodbConfig';

/**
 * GET /api/presupuestos/:id/pdf
 * Descarga el PDF guardado en la base de datos
 * Solo disponible para presupuestos en estado "enviado", "aceptado" o "rechazado"
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // 1. Obtener el presupuesto
    const presupuesto = await getPresupuestoById(id);

    if (!presupuesto) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    const estado = presupuesto.fields.Estado || ESTADOS_PRESUPUESTO.BORRADOR;

    // 2. Validar que NO esté en borrador
    if (estado === ESTADOS_PRESUPUESTO.BORRADOR) {
      return NextResponse.json(
        { error: 'El presupuesto está en borrador. Use /pdf/preview para visualización temporal.' },
        { status: 400 }
      );
    }

    // 3. Validar que requiera PDF guardado
    if (!requierePDFGuardado(estado)) {
      return NextResponse.json(
        { error: 'Este estado no tiene PDF asociado' },
        { status: 400 }
      );
    }

    // 4. Obtener el PDF del campo attachment
    const pdfAttachment = presupuesto.fields.PDF;

    console.log('PDF Attachment field:', pdfAttachment);
    console.log('PDF Attachment type:', typeof pdfAttachment);

    if (!pdfAttachment) {
      return NextResponse.json(
        { error: 'No hay PDF asociado a este presupuesto.' },
        { status: 404 }
      );
    }

    // 5. Parsear el attachment si es un string JSON
    let attachments = pdfAttachment;
    if (typeof pdfAttachment === 'string') {
      try {
        attachments = JSON.parse(pdfAttachment);
      } catch (e) {
        console.error('Error parsing PDF attachment:', e);
        return NextResponse.json(
          { error: 'Formato de PDF inválido' },
          { status: 500 }
        );
      }
    }

    if (!Array.isArray(attachments) || attachments.length === 0) {
      return NextResponse.json(
        { error: 'No hay PDF asociado a este presupuesto.' },
        { status: 404 }
      );
    }

    console.log('Parsed attachments:', attachments);

    // 6. Obtener la URL del PDF (NocoDB devuelve un array de attachments)
    let pdfUrl = attachments[0].url || attachments[0].signedUrl || attachments[0].path;

    console.log('PDF URL (raw):', pdfUrl);

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'No se pudo obtener la URL del PDF' },
        { status: 500 }
      );
    }

    // Si la URL es relativa, construir URL completa
    if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
      // La URL es relativa, necesitamos agregar el dominio de NocoDB
      pdfUrl = `${NOCODB_URL}/${pdfUrl}`;
      console.log('PDF URL (complete):', pdfUrl);
    }

    // 7. Descargar y servir el archivo
    const pdfResponse = await fetch(pdfUrl, {
      headers: {
        'xc-token': API_TOKEN,
      }
    });
    if (!pdfResponse.ok) {
      throw new Error('Error al descargar el PDF desde NocoDB');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="presupuesto-${id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error al obtener PDF guardado:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener el PDF' },
      { status: 500 }
    );
  }
}
