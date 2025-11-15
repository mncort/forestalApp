import { NextResponse } from 'next/server';
import { getPresupuestoById, actualizarPresupuesto } from '@/services/presupuestos';
import { getItemsByPresupuesto } from '@/services/presupuestoItems';
import { puedeTransicionar, ESTADOS_PRESUPUESTO } from '@/lib/stateMachine/presupuestoStates';
import { generarPDFPresupuesto } from '@/lib/pdf/generarPresupuestoPDF';
import PresupuestoPDF from '@/components/pdf/PresupuestoPDF';
import { NOCODB_URL, API_TOKEN, BASE_ID, TABLES } from '@/models/nocodbConfig';

/**
 * PUT /api/presupuestos/:id/estado
 * Cambia el estado de un presupuesto
 * Si la transición es de borrador → enviado, genera y guarda el PDF
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { nuevoEstado } = await request.json();

    // 1. Validar que se envió el nuevo estado
    if (!nuevoEstado) {
      return NextResponse.json(
        { error: 'El campo nuevoEstado es requerido' },
        { status: 400 }
      );
    }

    // 2. Obtener el presupuesto actual
    const presupuesto = await getPresupuestoById(id);

    if (!presupuesto) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    const estadoActual = presupuesto.fields.Estado || ESTADOS_PRESUPUESTO.BORRADOR;

    // 3. Validar transición de estado
    if (!puedeTransicionar(estadoActual, nuevoEstado)) {
      return NextResponse.json(
        { error: `La transición de estado de "${estadoActual}" a "${nuevoEstado}" no está permitida.` },
        { status: 400 }
      );
    }

    // 4. Caso especial: Borrador → Enviado (generar y guardar PDF)
    if (estadoActual === ESTADOS_PRESUPUESTO.BORRADOR && nuevoEstado === ESTADOS_PRESUPUESTO.ENVIADO) {
      try {
        // 4.1 Obtener items del presupuesto
        const items = await getItemsByPresupuesto(id);

        if (!items || items.length === 0) {
          return NextResponse.json(
            { error: 'No se puede enviar un presupuesto sin items' },
            { status: 400 }
          );
        }

        // 4.2 Generar PDF usando el componente PresupuestoPDF
        const buffer = await generarPDFPresupuesto(presupuesto, items, PresupuestoPDF);

        // 4.3 Subir PDF a NocoDB usando la API correcta
        const formData = new FormData();
        const filename = `presupuesto-${id}-${Date.now()}.pdf`;
        formData.append('file', new Blob([buffer], { type: 'application/pdf' }), filename);

        // Paso 1: Subir archivo al storage de NocoDB
        const uploadUrl = `${NOCODB_URL}/api/v2/storage/upload`;

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'xc-token': API_TOKEN,
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error('Error al subir PDF a NocoDB:', errorData);
          throw new Error('Error al guardar el PDF en la base de datos');
        }

        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);

        // Paso 2: Actualizar el registro con el attachment y el estado
        // NocoDB devuelve un array de objetos con la estructura correcta
        // Solo necesitamos pasarlo directamente (sin JSON.stringify)
        const attachmentData = Array.isArray(uploadData) ? uploadData : [uploadData];

        console.log('Attachment data to save:', attachmentData);

        // Actualizar el campo PDF y Estado del presupuesto en una sola llamada
        await actualizarPresupuesto(id, {
          PDF: attachmentData,
          Estado: ESTADOS_PRESUPUESTO.ENVIADO
        });

        return NextResponse.json({
          success: true,
          mensaje: 'Presupuesto enviado y PDF guardado correctamente',
          estadoAnterior: estadoActual,
          estadoNuevo: nuevoEstado
        });

      } catch (error) {
        console.error('Error al generar/guardar PDF:', error);
        return NextResponse.json(
          { error: 'No se pudo generar el PDF. El presupuesto permanece en borrador.' },
          { status: 500 }
        );
      }
    }

    // 5. Otras transiciones (Enviado → Aprobado/Rechazado)
    // Solo actualizar el estado, NO tocar el PDF
    await actualizarPresupuesto(id, { Estado: nuevoEstado });

    return NextResponse.json({
      success: true,
      mensaje: `Presupuesto actualizado a estado: ${nuevoEstado}`,
      estadoAnterior: estadoActual,
      estadoNuevo: nuevoEstado
    });

  } catch (error) {
    console.error('Error al cambiar estado del presupuesto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cambiar estado del presupuesto' },
      { status: 500 }
    );
  }
}
