# Documentación del Proyecto Forestal App

Este directorio contiene toda la documentación técnica del proyecto.

---

## 📚 Índice de Documentación

### 🔍 Análisis y Planificación

#### [ANALISIS.md](./ANALISIS.md)
**Análisis Inicial del Proyecto**
- 55+ archivos fuente analizados
- 10 problemas identificados (3 críticos, 4 moderados, 3 menores)
- 35% de código duplicado detectado
- 1,085 líneas duplicadas en modales
- Análisis de complejidad y organización

**Principales hallazgos:**
- 6 modales con lógica duplicada
- Hook de 279 líneas con 7 responsabilidades
- API de 301 líneas mezclando cálculos y CRUD
- Falta de validaciones centralizadas

---

#### [PLAN_REFACTORIZACION.md](./PLAN_REFACTORIZACION.md)
**Plan Completo de Refactorización (3 Fases)**

**Fase 1 - Eliminar Duplicación (1-2 semanas)**
- Crear hook `useFormModal`
- Separar cálculos de API
- Separar items CRUD

**Fase 2 - Modularización (2-3 semanas)**
- Dividir hooks grandes
- Extraer componentes de tablas
- Centralizar validaciones
- Crear hooks útiles

**Fase 3 - Documentación y Testing (1-2 semanas)**
- JSDoc completo
- Tests unitarios
- Documentación para desarrolladores

---

### ✅ Fases Completadas

#### [FASE1_COMPLETADA.md](./FASE1_COMPLETADA.md)
**Fase 1: Eliminación de Duplicación - COMPLETADA ✅**

**Logros:**
- ✅ Hook `useFormModal` creado (130 líneas)
- ✅ 5 modales refactorizados
- ✅ API organizado (calculations + items)
- ✅ 525 líneas eliminadas
- ✅ 395 líneas de código reutilizable

**Impacto:**
- Código duplicado: 35% → <5%
- Modales: 1,195 → 670 líneas (-44%)
- API: 301 → 90 líneas (-70%)

**Archivos nuevos:**
- `src/hooks/useFormModal.js`
- `src/lib/calculations/presupuestos.js`
- `src/lib/api/presupuestoItems.js`

---

#### [FASE2_COMPLETADA.md](./FASE2_COMPLETADA.md)
**Fase 2: Modularización - COMPLETADA ✅**

**Tareas Completadas (4/4):**
1. ✅ Dividir Hook usePresupuestoItems (279 → 5 hooks)
2. ✅ Extraer Tablas a Componentes (ahorro 100 líneas)
3. ✅ Centralizar Validaciones (9 validadores)
4. ✅ Crear Hook useToast (API simplificada)

**Impacto:**
- 13 archivos creados
- 282 líneas eliminadas
- 582 líneas de código reutilizable
- Ahorro neto: ~100 líneas

**Componentes nuevos:**
- `DataTable` y `TablePagination`
- Hook `useToast`
- Validaciones centralizadas
- 5 hooks especializados

---

## 📁 Documentos Históricos

### [archive/](./archive/)

Documentos de progreso intermedio y análisis históricos:

- **ANALISIS_API_NOCODB.md** - Análisis de consumo de API NocoDB
  - Aspectos positivos (Promise.all, debounce, batch saving)
  - Problemas identificados
  - Recomendaciones de optimización

- **FASE2_PROGRESO.md** - Documento intermedio de progreso Fase 2
  - Progreso de Tarea 2.1 (División de hooks)
  - Estado durante el desarrollo

---

## 📊 Resumen del Proyecto

### Estado Actual

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Duplicación** | 35% | <3% | -32% |
| **Líneas eliminadas** | - | ~625 | - |
| **Código reutilizable** | 0 | ~750 líneas | +750 |
| **Modales con patrón** | 0 | 5 | +5 |
| **Páginas con tablas** | 3 | 3 (refactorizadas) | 0 |
| **Validadores centralizados** | 0 | 9 | +9 |

### Arquitectura Mejorada

```
src/
├── app/                    # Next.js App Router
│   └── (protected)/       # Rutas protegidas
│       ├── clientes/      # ✅ Refactorizado con DataTable
│       ├── productos/     # ✅ Refactorizado con DataTable
│       └── presupuestos/  # ✅ Refactorizado con DataTable
│
├── components/
│   ├── modals/            # ✅ 5 modales con useFormModal
│   │   ├── categorias/
│   │   ├── clientes/
│   │   ├── productos/
│   │   └── presupuestos/
│   │       └── hooks/     # ✅ 5 hooks especializados
│   │
│   └── tables/            # ✅ NUEVO - Componentes reutilizables
│       ├── DataTable.jsx
│       ├── TablePagination.jsx
│       └── index.js
│
├── hooks/                 # ✅ Custom hooks
│   ├── useFormModal.js    # ✅ NUEVO - Hook de formularios
│   ├── useToast.js        # ✅ NUEVO - Notificaciones
│   ├── usePagination.js
│   └── useNocoDB.js
│
└── lib/
    ├── api/               # ✅ API organizado
    │   ├── base.js
    │   ├── clientes.js
    │   ├── presupuestos.js      # ✅ Solo CRUD (90 líneas)
    │   ├── presupuestoItems.js  # ✅ NUEVO - Items (110 líneas)
    │   └── index.js
    │
    ├── calculations/      # ✅ NUEVO - Lógica de negocio
    │   └── presupuestos.js      # ✅ Cálculos (155 líneas)
    │
    └── utils/             # ✅ Utilidades
        └── validation.js  # ✅ Validaciones centralizadas (248 líneas)
```

---

## 🎯 Patrones Establecidos

### 1. Modales con useFormModal

```javascript
const { formData, updateField, handleSave, saving } = useFormModal({
  entity: item,
  initialFormData: { field: '' },
  validate: (data) => ({ valid: true, errors: {} }),
  transformData: (data) => ({ Field: data.field }),
  onSave: async (data, isEdit, id) => { /* ... */ },
  onSuccess: async () => { /* ... */ },
  messages: { created: '...', updated: '...' }
});
```

### 2. Tablas Reutilizables

```javascript
const columns = [
  { key: 'name', header: 'Nombre', render: (item) => <Custom /> }
];

<DataTable columns={columns} data={data} loading={loading} />
<TablePagination {...paginacion} />
```

### 3. Validaciones Centralizadas

```javascript
import { validarTextoRequerido, mensajesError } from '@/lib/utils/validation';

if (!validarTextoRequerido(data.nombre)) {
  errors.nombre = mensajesError.textoRequerido('el nombre');
}
```

### 4. Notificaciones con useToast

```javascript
const toast = useToast();

toast.success(toastMessages.created('Cliente'));
toast.promise(asyncOp(), { loading: '...', success: '...', error: '...' });
```

---

## 🚀 Próximos Pasos

### Fase 3 - Testing y Documentación (Propuesta)

**Tareas pendientes:**
1. ⏳ Tests unitarios para validaciones
2. ⏳ Tests para hooks (useFormModal, useToast)
3. ⏳ Tests para componentes de tablas
4. ⏳ JSDoc completo en todas las funciones
5. ⏳ Guías de desarrollo para el equipo

---

## 📖 Cómo Usar Esta Documentación

### Para Nuevos Desarrolladores
1. Leer [ANALISIS.md](./ANALISIS.md) para entender el contexto
2. Revisar [PLAN_REFACTORIZACION.md](./PLAN_REFACTORIZACION.md) para ver la visión completa
3. Estudiar [FASE1_COMPLETADA.md](./FASE1_COMPLETADA.md) y [FASE2_COMPLETADA.md](./FASE2_COMPLETADA.md)

### Para Agregar Features
1. Usar los patrones establecidos (ver sección "Patrones Establecidos")
2. Reutilizar componentes y hooks existentes
3. Seguir las convenciones de validación y notificaciones

### Para Debugging
1. Los componentes están modularizados por responsabilidad
2. Cada archivo tiene JSDoc con descripción
3. Validaciones centralizadas en `lib/utils/validation.js`

---

## 💡 Filosofía del Proyecto

**Principios aplicados:**
- ✅ **DRY** (Don't Repeat Yourself) - Código reutilizable
- ✅ **Single Responsibility** - Un propósito por archivo
- ✅ **Separation of Concerns** - API, cálculos, UI separados
- ✅ **Composition over Inheritance** - Hooks componibles
- ✅ **Explicit over Implicit** - Código claro y predecible

**Resultado:**
- Código más limpio y mantenible
- Fácil agregar nuevas features
- Testing simplificado
- Onboarding más rápido

---

**Última actualización:** 28 de Octubre, 2025
