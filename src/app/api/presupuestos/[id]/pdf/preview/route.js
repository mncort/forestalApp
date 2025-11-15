import { NextResponse } from 'next/server';
import { getPresupuestoById } from '@/services/presupuestos';
import { getItemsByPresupuesto } from '@/services/presupuestoItems';
import { generarPDFPresupuesto } from '@/lib/pdf/generarPresupuestoPDF';
import PresupuestoPDF from '@/components/pdf/PresupuestoPDF';

/**
 * GET /api/presupuestos/:id/pdf/preview
 * Genera un PDF temporal (en memoria) sin guardarlo en la base de datos
 * Usado para previsualizar presupuestos en estado "borrador"
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

    // 2. Obtener items del presupuesto
    const items = await getItemsByPresupuesto(id);

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El presupuesto no tiene items para generar el PDF' },
        { status: 400 }
      );
    }

    // 3. Generar PDF temporalmente (sin guardar en BD) usando el componente PresupuestoPDF
    const buffer = await generarPDFPresupuesto(presupuesto, items, PresupuestoPDF);

    // 4. Devolver el PDF como respuesta
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="presupuesto-${id}-preview.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error al generar preview de PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar el preview del PDF' },
      { status: 500 }
    );
  }
}
