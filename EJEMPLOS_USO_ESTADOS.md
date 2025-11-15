# Ejemplos de Uso - Estados de Presupuestos

## 📌 Índice

1. [Uso desde el Frontend (React)](#uso-desde-el-frontend-react)
2. [Uso desde el Backend (API)](#uso-desde-el-backend-api)
3. [Validaciones](#validaciones)
4. [Casos de uso comunes](#casos-de-uso-comunes)

---

## Uso desde el Frontend (React)

### 1. Componente con gestión de estados

```jsx
import { usePresupuestoEstado } from '@/components/modals/presupuestos/hooks/usePresupuestoEstado';
import PresupuestoEstadoHeader from '@/components/modals/presupuestos/components/PresupuestoEstadoHeader';

function MiComponentePresupuesto({ presupuesto, onUpdate }) {
  // Hook para gestionar estados
  const {
    estadoActual,      // 'borrador' | 'enviado' | 'aceptado' | 'rechazado'
    esEditable,        // true si se puede editar
    tienePDF,          // true si tiene PDF guardado
    cambiandoEstado,   // true mientras cambia estado
    generandoPDF,      // true mientras genera PDF
    cambiarEstado,     // Función para cambiar estado
    verPDF            // Función para ver/descargar PDF
  } = usePresupuestoEstado(presupuesto, onUpdate);

  return (
    <div>
      {/* Header con botones de estado */}
      <PresupuestoEstadoHeader
        estadoActual={estadoActual}
        esEditable={esEditable}
        cambiandoEstado={cambiandoEstado}
        generandoPDF={generandoPDF}
        onCambiarEstado={cambiarEstado}
        onVerPDF={verPDF}
      />

      {/* Formulario - deshabilitar si no es editable */}
      <input
        type="text"
        disabled={!esEditable}
        value={descripcion}
        onChange={handleChange}
      />

      <button
        disabled={!esEditable}
        onClick={handleAgregarProducto}
      >
        Agregar Producto
      </button>
    </div>
  );
}
```

### 2. Cambiar estado manualmente

```jsx
import { useState } from 'react';
import toast from 'react-hot-toast';

function CambiarEstadoButton({ presupuesto, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!confirm('¿Confirma enviar este presupuesto?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/presupuestos/${presupuesto.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado: 'enviado' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      toast.success(result.mensaje);
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleEnviar} disabled={loading}>
      {loading ? 'Enviando...' : 'Enviar Presupuesto'}
    </button>
  );
}
```

### 3. Ver PDF según estado

```jsx
function VerPDFButton({ presupuesto }) {
  const [loading, setLoading] = useState(false);
  const estadoActual = presupuesto?.fields?.Estado?.toLowerCase() || 'borrador';

  const handleVerPDF = async () => {
    setLoading(true);
    try {
      let url;

      if (estadoActual === 'borrador') {
        // Preview temporal
        url = `/api/presupuestos/${presupuesto.id}/pdf/preview`;
      } else {
        // PDF guardado
        url = `/api/presupuestos/${presupuesto.id}/pdf`;
      }

      // Abrir en nueva ventana
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleVerPDF} disabled={loading}>
      {loading ? 'Generando...' : `Ver PDF ${estadoActual === 'borrador' ? '(Preview)' : ''}`}
    </button>
  );
}
```

---

## Uso desde el Backend (API)

### 1. Cambiar estado de presupuesto

```javascript
// PUT /api/presupuestos/[id]/estado

import { NextResponse } from 'next/server';
import { getPresupuestoById, actualizarPresupuesto } from '@/services/presupuestos';
import { puedeTransicionar } from '@/lib/stateMachine/presupuestoStates';

export async function PUT(request, { params }) {
  const { id } = params;
  const { nuevoEstado } = await request.json();

  // 1. Obtener presupuesto
  const presupuesto = await getPresupuestoById(id);
  if (!presupuesto) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
  }

  const estadoActual = presupuesto.fields.Estado?.toLowerCase() || 'borrador';

  // 2. Validar transición
  if (!puedeTransicionar(estadoActual, nuevoEstado)) {
    return NextResponse.json(
      { error: `La transición de ${estadoActual} a ${nuevoEstado} no está permitida` },
      { status: 400 }
    );
  }

  // 3. Actualizar estado
  await actualizarPresupuesto(id, { Estado: nuevoEstado });

  return NextResponse.json({ success: true, estadoNuevo: nuevoEstado });
}
```

### 2. Validar edición antes de actualizar

```javascript
import { validarEditable } from '@/services/presupuestos';

// En cualquier endpoint de edición
export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();

  try {
    // Validar que el presupuesto sea editable
    await validarEditable(id);

    // Si llega aquí, está en borrador y se puede editar
    await actualizarPresupuesto(id, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.status === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    throw error;
  }
}
```

### 3. Generar PDF

```javascript
import { generarPresupuestoPDF } from '@/lib/pdf/presupuestoPDF';
import { getPresupuestoById } from '@/services/presupuestos';
import { getItemsByPresupuesto } from '@/services/presupuestoItems';

export async function GET(request, { params }) {
  const { id } = params;

  // 1. Obtener datos
  const presupuesto = await getPresupuestoById(id);
  const items = await getItemsByPresupuesto(id);

  // 2. Generar PDF
  const pdfBlob = await generarPresupuestoPDF(presupuesto, items);

  // 3. Devolver
  const arrayBuffer = await pdfBlob.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="presupuesto-${id}.pdf"`
    }
  });
}
```

---

## Validaciones

### State Machine - Validar transiciones

```javascript
import { puedeTransicionar, ESTADOS_PRESUPUESTO } from '@/lib/stateMachine/presupuestoStates';

// Ejemplos de transiciones válidas
puedeTransicionar('borrador', 'enviado');      // ✅ true
puedeTransicionar('enviado', 'aceptado');      // ✅ true
puedeTransicionar('enviado', 'rechazado');     // ✅ true

// Ejemplos de transiciones inválidas
puedeTransicionar('borrador', 'aceptado');     // ❌ false
puedeTransicionar('enviado', 'borrador');      // ❌ false
puedeTransicionar('aceptado', 'rechazado');    // ❌ false
```

### Validar si es editable

```javascript
import { esEditable } from '@/lib/stateMachine/presupuestoStates';

esEditable('borrador');    // ✅ true
esEditable('enviado');     // ❌ false
esEditable('aceptado');    // ❌ false
esEditable('rechazado');   // ❌ false
```

### Validar si requiere PDF guardado

```javascript
import { requierePDFGuardado } from '@/lib/stateMachine/presupuestoStates';

requierePDFGuardado('borrador');     // ❌ false
requierePDFGuardado('enviado');      // ✅ true
requierePDFGuardado('aceptado');     // ✅ true
requierePDFGuardado('rechazado');    // ✅ true
```

---

## Casos de uso comunes

### Caso 1: Flujo completo de presupuesto

```javascript
// 1. Crear presupuesto (borrador)
const presupuesto = await crearPresupuesto({
  nc_1g29__Clientes_id: 'cliente-123',
  Descripcion: 'Presupuesto para obra',
  efectivo: false,
  Estado: 'borrador'
});

console.log(presupuesto.fields.Estado); // 'borrador'

// 2. Agregar productos (solo en borrador)
await crearPresupuestoItem({
  nc_1g29___Presupuestos_id: presupuesto.id,
  nc_1g29__Productos_id: 'producto-456',
  Cantidad: 10,
  PrecioUnitario: 1500
});

// 3. Ver preview del PDF (no se guarda)
window.open(`/api/presupuestos/${presupuesto.id}/pdf/preview`, '_blank');

// 4. Enviar presupuesto (genera y guarda PDF)
await fetch(`/api/presupuestos/${presupuesto.id}/estado`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nuevoEstado: 'enviado' })
});

// 5. Intentar editar (debe fallar)
try {
  await actualizarPresupuesto(presupuesto.id, { Descripcion: 'Nueva desc' });
} catch (error) {
  console.log(error.message); // "El presupuesto no puede modificarse porque ya fue enviado."
}

// 6. Descargar PDF guardado
window.open(`/api/presupuestos/${presupuesto.id}/pdf`, '_blank');

// 7. Aceptar presupuesto
await fetch(`/api/presupuestos/${presupuesto.id}/estado`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nuevoEstado: 'aceptado' })
});
```

### Caso 2: Componente de tabla con estados

```jsx
function PresupuestosTable({ presupuestos, onUpdate }) {
  const getBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'borrador': return 'bg-gray-200 text-gray-800';
      case 'enviado': return 'bg-blue-500 text-white';
      case 'aceptado': return 'bg-green-500 text-white';
      case 'rechazado': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th>PDF</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {presupuestos.map((p) => {
          const estado = p.fields.Estado?.toLowerCase() || 'borrador';
          const esEditable = estado === 'borrador';
          const tienePDF = p.fields.PDF && p.fields.PDF.length > 0;

          return (
            <tr key={p.id}>
              <td>{p.fields.Id}</td>
              <td>{p.fields.ClienteCompleto?.Nombre}</td>
              <td>
                <span className={`badge ${getBadgeColor(estado)}`}>
                  {estado.toUpperCase()}
                </span>
              </td>
              <td>
                {tienePDF ? (
                  <a href={`/api/presupuestos/${p.id}/pdf`} target="_blank">
                    Descargar
                  </a>
                ) : (
                  <a href={`/api/presupuestos/${p.id}/pdf/preview`} target="_blank">
                    Preview
                  </a>
                )}
              </td>
              <td>
                {esEditable && (
                  <button onClick={() => onEdit(p)}>Editar</button>
                )}
                {estado === 'borrador' && (
                  <button onClick={() => onEnviar(p.id)}>Enviar</button>
                )}
                {estado === 'enviado' && (
                  <>
                    <button onClick={() => onAceptar(p.id)}>Aceptar</button>
                    <button onClick={() => onRechazar(p.id)}>Rechazar</button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

### Caso 3: Guardar PDF en servidor local (alternativa)

Si prefieres guardar el PDF en el servidor local en lugar de NocoDB:

```javascript
import fs from 'fs/promises';
import path from 'path';

async function guardarPDFLocal(presupuestoId, pdfBuffer) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'presupuestos');

  // Crear directorio si no existe
  await fs.mkdir(uploadsDir, { recursive: true });

  // Guardar archivo
  const filename = `presupuesto-${presupuestoId}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, pdfBuffer);

  // Retornar URL pública
  return `/uploads/presupuestos/${filename}`;
}

// Usar en el endpoint de estado
if (estadoActual === 'borrador' && nuevoEstado === 'enviado') {
  const pdfBlob = await generarPresupuestoPDF(presupuesto, items);
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Guardar localmente
  const pdfUrl = await guardarPDFLocal(id, buffer);

  // Actualizar presupuesto con la URL
  await actualizarPresupuesto(id, {
    Estado: 'enviado',
    PDF_URL: pdfUrl
  });
}
```

---

## Consejos y Mejores Prácticas

### ✅ DO

- **Validar siempre en el backend**: Las validaciones del frontend son solo UX
- **Usar el hook `usePresupuestoEstado`**: Simplifica la lógica de estados
- **Mostrar confirmaciones**: Especialmente al enviar (genera PDF y bloquea edición)
- **Manejar errores**: Mostrar mensajes claros al usuario
- **Testing**: Probar todos los flujos posibles

### ❌ DON'T

- **No confiar solo en el frontend**: Un usuario puede hacer requests directos a la API
- **No modificar estados manualmente**: Usar siempre el endpoint `/estado`
- **No regenerar PDFs**: Una vez guardado, el PDF es inmutable
- **No permitir "saltos" de estado**: Seguir siempre el flujo del state machine

---

## Depuración

### Ver estado actual en consola

```javascript
console.log('Estado:', presupuesto.fields.Estado);
console.log('Es editable?', esEditable(presupuesto.fields.Estado));
console.log('Tiene PDF?', presupuesto.fields.PDF?.length > 0);
```

### Ver transiciones disponibles

```javascript
import { getEstadosDisponibles } from '@/lib/stateMachine/presupuestoStates';

const estadoActual = 'enviado';
const disponibles = getEstadosDisponibles(estadoActual);
console.log(`Desde "${estadoActual}" puedo ir a:`, disponibles);
// Output: Desde "enviado" puedo ir a: ["aceptado", "rechazado"]
```

### Logs del servidor

Agrega logs para debugging:

```javascript
console.log('[ESTADO] Cambiando de', estadoActual, 'a', nuevoEstado);
console.log('[PDF] Generando PDF para presupuesto', presupuestoId);
console.log('[PDF] Tamaño del PDF:', pdfBuffer.length, 'bytes');
console.log('[PDF] Guardado exitosamente en NocoDB');
```

---

¿Necesitas más ejemplos o casos de uso específicos? ¡Déjame saber!
