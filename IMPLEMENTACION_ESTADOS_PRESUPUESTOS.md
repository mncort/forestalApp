# Implementación de Estados de Presupuestos

## Resumen

Esta implementación agrega un sistema de control de estados para presupuestos con las siguientes características:

- **State Machine**: Control de transiciones de estado (`borrador` → `enviado` → `aceptado`/`rechazado`)
- **Generación de PDF**: PDF temporal en borrador, PDF guardado en estados enviado+
- **Bloqueo de edición**: Los presupuestos no se pueden editar una vez enviados
- **Validaciones**: Backend y frontend validan las operaciones según el estado

---

## 🎯 Estados Disponibles

| Estado | Descripción | Puede transicionar a | PDF guardado |
|--------|-------------|---------------------|--------------|
| **borrador** | Estado inicial, editable | enviado | ❌ No |
| **enviado** | Presupuesto enviado al cliente | aceptado, rechazado | ✅ Sí |
| **aceptado** | Presupuesto aceptado (final) | - | ✅ Sí |
| **rechazado** | Presupuesto rechazado (final) | - | ✅ Sí |

---

## 📂 Archivos Creados

### Backend

1. **State Machine**
   - `src/lib/stateMachine/presupuestoStates.js` - Lógica de transiciones de estado

2. **Generación de PDF**
   - `src/lib/pdf/presupuestoPDF.js` - Utilidades para generar PDF

3. **API Endpoints**
   - `src/app/api/presupuestos/[id]/estado/route.js` - Cambiar estado
   - `src/app/api/presupuestos/[id]/pdf/preview/route.js` - Preview temporal
   - `src/app/api/presupuestos/[id]/pdf/route.js` - Descargar PDF guardado

4. **Servicios actualizados**
   - `src/services/presupuestos.js` - Agregada validación de edición
   - `src/services/presupuestoItems.js` - Agregada validación de edición

### Frontend

1. **Hooks**
   - `src/components/modals/presupuestos/hooks/usePresupuestoEstado.js`

2. **Componentes**
   - `src/components/modals/presupuestos/components/PresupuestoEstadoHeader.jsx`

3. **Modal actualizado**
   - `src/components/modals/presupuestos/PresupuestoModal.jsx` - Integrado con estados

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install jspdf jspdf-autotable
```

### 2. Verificar campo PDF en NocoDB

Asegúrate de que la tabla `Presupuestos` en NocoDB tenga:

- Campo `Estado` (tipo: SingleLineText o SingleSelect)
- Campo `PDF` (tipo: **Attachment**) ⚠️ **IMPORTANTE**

Si no existe el campo `PDF`, créalo en NocoDB:
1. Ir a la tabla `Presupuestos`
2. Agregar columna → Tipo: **Attachment**
3. Nombre: `PDF`

### 3. Actualizar variables de entorno (si es necesario)

Verifica que tu `.env.local` tenga las credenciales correctas de NocoDB:

```env
NOCODB_URL=https://tu-nocodb-url.com
NOCODB_TOKEN=tu_token_aqui
NEXT_PUBLIC_NOCODB_BASE_ID=tu_base_id
NEXT_PUBLIC_TABLE_PRESUPUESTOS=tu_table_id
```

---

## 📖 Uso

### 1. Crear un presupuesto (estado: borrador)

El presupuesto se crea automáticamente en estado `borrador`:

```javascript
const presupuesto = await crearPresupuesto({
  nc_1g29__Clientes_id: 'cliente-id',
  Descripcion: 'Presupuesto ejemplo',
  efectivo: false,
  Estado: 'borrador' // Automático
});
```

### 2. Editar presupuesto en borrador

Mientras esté en `borrador`, se puede:
- ✅ Modificar datos generales
- ✅ Agregar/eliminar productos
- ✅ Cambiar cantidades
- ✅ Cambiar tipo de pago
- ✅ Ver PDF preview (temporal, NO se guarda)

### 3. Enviar presupuesto (borrador → enviado)

Al cambiar el estado a `enviado`:
1. Se genera el PDF con los datos actuales
2. Se guarda en NocoDB (campo `PDF`)
3. Se actualiza el estado a `enviado`
4. ❌ **Ya NO se puede editar**

**Frontend:**
```javascript
// Usando el hook
const { cambiarEstado } = usePresupuestoEstado(presupuesto, onSaved);

await cambiarEstado('enviado');
```

**API:**
```javascript
await fetch(`/api/presupuestos/${id}/estado`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nuevoEstado: 'enviado' })
});
```

### 4. Aceptar o rechazar presupuesto (enviado → aceptado/rechazado)

Una vez enviado, el cliente puede:

```javascript
// Aceptar
await cambiarEstado('aceptado');

// Rechazar
await cambiarEstado('rechazado');
```

### 5. Visualizar PDF

**En estado borrador:**
```javascript
// Preview temporal (NO se guarda)
window.open(`/api/presupuestos/${id}/pdf/preview`, '_blank');
```

**En estados enviado/aceptado/rechazado:**
```javascript
// Descarga el PDF guardado en BD
window.open(`/api/presupuestos/${id}/pdf`, '_blank');
```

---

## 🔒 Validaciones

### Backend

Todas las validaciones están en el backend para seguridad:

```javascript
// Intento de editar presupuesto enviado
await actualizarPresupuesto(id, { Descripcion: 'Nuevo' });
// ❌ Error 403: "El presupuesto no puede modificarse porque ya fue enviado."

// Intento de transición inválida
await cambiarEstado('borrador', 'aceptado');
// ❌ Error 400: "La transición de estado de borrador a aceptado no está permitida."
```

### Frontend

El frontend deshabilita controles para mejor UX:

```jsx
<Input
  disabled={!esEditable}
  value={descripcion}
  onChange={handleChange}
/>

<Button
  disabled={!esEditable}
  onClick={handleAgregar}
>
  Agregar Producto
</Button>
```

---

## 🧪 Testing

### Test manual del flujo completo

1. **Crear presupuesto**
   - Estado inicial: `borrador`
   - Verificar que se puede editar

2. **Agregar productos**
   - Agregar 2-3 productos
   - Modificar cantidades
   - Verificar que se guarda correctamente

3. **Ver PDF preview**
   - Hacer clic en "Ver PDF (Preview)"
   - Verificar que se genera y muestra
   - Verificar que NO se guarda en NocoDB

4. **Enviar presupuesto**
   - Hacer clic en "Enviar Presupuesto"
   - Verificar confirmación
   - Verificar que:
     - ✅ Estado cambia a `enviado`
     - ✅ Se genera y guarda el PDF
     - ✅ Ya NO se puede editar
     - ✅ Botón "Ver PDF" descarga el archivo guardado

5. **Intentar editar (debe fallar)**
   - Intentar cambiar descripción → **Deshabilitado**
   - Intentar agregar producto → **Deshabilitado**

6. **Aceptar presupuesto**
   - Hacer clic en "Aceptar"
   - Verificar que estado cambia a `aceptado`
   - Verificar que PDF sigue disponible

---

## 🐛 Troubleshooting

### Error: "No se pudo generar el PDF"

**Causa:** Fallo en la generación del PDF o subida a NocoDB

**Solución:**
1. Verificar que el presupuesto tiene items
2. Verificar que el campo `PDF` existe en NocoDB (tipo Attachment)
3. Verificar credenciales de NocoDB en `.env.local`
4. Revisar logs del servidor

### Error: "La transición de estado no está permitida"

**Causa:** Intento de transición inválida

**Solución:**
- Revisar el diagrama de estados
- Solo se puede ir: `borrador` → `enviado` → `aceptado`/`rechazado`

### El PDF no se descarga

**Causa:** Campo `PDF` vacío o no existe

**Solución:**
1. Verificar que el presupuesto se envió correctamente
2. Verificar en NocoDB que el campo `PDF` tiene un archivo
3. Intentar regenerar enviando nuevamente (primero volver a borrador si es posible)

### Los inputs están deshabilitados pero no deberían

**Causa:** Estado incorrecto del presupuesto

**Solución:**
- Verificar que el campo `Estado` en NocoDB sea exactamente: `borrador`, `enviado`, `aceptado` o `rechazado` (todo en minúsculas)
- Si está en mayúsculas o mixto, corregirlo manualmente en NocoDB

---

## 📊 Diagrama de Flujo

```
┌──────────────┐
│   BORRADOR   │  ← Estado inicial
│  (editable)  │  ← Se puede modificar todo
│ PDF: preview │  ← PDF temporal (no se guarda)
└──────┬───────┘
       │
       │ "Enviar Presupuesto"
       │ (genera y guarda PDF)
       ▼
┌──────────────┐
│   ENVIADO    │  ← PDF guardado en BD
│ (solo lectura)│  ← NO se puede editar
└──────┬───────┘
       │
       ├────────────────┐
       │                │
       │ "Aceptar"      │ "Rechazar"
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│   ACEPTADO   │  │  RECHAZADO   │
│   (final)    │  │    (final)   │
└──────────────┘  └──────────────┘
```

---

## 🔐 Seguridad

- ✅ Todas las validaciones se hacen en el **backend**
- ✅ El frontend solo deshabilita controles para UX
- ✅ No se puede saltar estados
- ✅ No se puede editar presupuestos enviados desde el cliente
- ✅ Los PDFs son inmutables una vez guardados

---

## 📝 Notas Importantes

1. **El PDF solo se guarda UNA VEZ**: Al enviar el presupuesto (borrador → enviado)

2. **El PDF es inmutable**: Una vez guardado, NO se regenera aunque cambien precios en el maestro de productos

3. **En borrador siempre se puede previsualizar**: El botón "Ver PDF" genera un preview temporal sin guardar

4. **Estados finales**: `aceptado` y `rechazado` no pueden cambiar a ningún otro estado

5. **Tipo de archivo**: El PDF se guarda como attachment en NocoDB (similar a subir un archivo manualmente)

---

## 🚧 Próximas mejoras (opcional)

- [ ] Tabla de auditoría de cambios de estado
- [ ] Envío automático de email al cliente al enviar presupuesto
- [ ] Notificaciones en tiempo real
- [ ] Versionado de presupuestos (múltiples revisiones antes del envío)
- [ ] Firma digital del PDF

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisar este documento
2. Verificar logs del servidor
3. Verificar configuración de NocoDB
4. Reportar el issue con detalles
